import { GoogleGenAI, GenerateContentResponse, Part, Chat } from "@google/genai";
import { ExpenseReportEntry, CompanyPolicy, ExpenseAnalysisResult, GeminiResponseJson, RiskScore } from '../types';
import { GEMINI_MODEL_NAME, GEMINI_SYSTEM_INSTRUCTION, GEMINI_RESPONSE_JSON_STRUCTURE, COMPANY_POLICIES, GEMINI_CHAT_SYSTEM_INSTRUCTION } from '../constants';

const API_KEY = process.env.API_KEY;

if (typeof API_KEY !== 'string' || API_KEY.trim() === '') {
  console.error(
    "CRITICAL: API_KEY environment variable is not set, empty, or not a string. " +
    "The application cannot connect to the Gemini API. " +
    "Please ensure `process.env.API_KEY` is securely configured as a non-empty string in your execution environment. "
  );
  throw new Error(
    "CRITICAL: API_KEY environment variable is not set, empty, or not a string. " +
    "The application cannot connect to the Gemini API."
  );
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// For Expense Analysis
const constructPromptForAnalysis = (
  expense: Omit<ExpenseReportEntry, 'id' | 'analysis' | 'receiptImageName'>,
  policies: CompanyPolicy[],
  receiptDescription?: string
): string => {
  let prompt = `Analyze the following expense report entry.
Expense Data:
- Employee: ${expense.employeeName}
- Date: ${expense.date}
- Amount: ${expense.amount} ${expense.currency}
- Vendor: ${expense.vendor}
- Category: ${expense.category}
- Description: ${expense.description}
`;

  if (receiptDescription) {
    prompt += `- Receipt Image Description: ${receiptDescription}\n`;
  } else {
    prompt += `- Receipt Image: Not provided or not analyzed.\n`;
  }
  
  prompt += `\nCompany Policies to consider:\n`;
  policies.forEach(p => {
    prompt += `- ${p.description}${p.details ? ` (${p.details})` : ''}\n`;
  });

  prompt += `\nPlease respond ONLY with a JSON object adhering to the following structure. Do not include markdown fences like \`\`\`json or any other text outside the JSON object itself.
${GEMINI_RESPONSE_JSON_STRUCTURE}
`;
  return prompt;
};


const parseGeminiAnalysisResponse = (responseText: string): ExpenseAnalysisResult => {
  let jsonStr = responseText.trim();
  
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }

  try {
    const parsed: GeminiResponseJson = JSON.parse(jsonStr);
    
    const riskScore = parsed.riskScore in RiskScore ? parsed.riskScore as RiskScore : RiskScore.Unknown;

    return {
      riskScore: riskScore,
      isFlagged: parsed.isFlagged || false,
      summary: parsed.summary || "No summary provided.",
      policyViolations: parsed.policyViolations?.map(pv => ({ policy: pv.policy || "N/A", details: pv.details || "N/A" })) || [],
      anomaliesDetected: parsed.anomaliesDetected?.map(ad => ({ anomaly: ad.anomaly || "N/A", details: ad.details || "N/A" })) || [],
      suspiciousLanguage: {
        detected: parsed.suspiciousLanguage?.detected || false,
        notes: parsed.suspiciousLanguage?.notes || "No specific notes.",
      },
      recommendedAction: parsed.recommendedAction || "Review recommended.",
    };
  } catch (error) {
    console.error("Failed to parse JSON response from Gemini Analysis:", error);
    console.error("Offending response text for analysis:", responseText);
    return {
      riskScore: RiskScore.Unknown,
      isFlagged: true,
      summary: "Error processing AI analysis. The response from the AI was not in the expected format.",
      policyViolations: [],
      anomaliesDetected: [],
      suspiciousLanguage: { detected: false, notes: "Analysis incomplete due to parsing error." },
      recommendedAction: "Manual review required due to AI processing error.",
    };
  }
};


export const analyzeExpenseWithGemini = async (
  expense: Omit<ExpenseReportEntry, 'id' | 'analysis' | 'receiptImageName'>,
  policies: CompanyPolicy[],
  base64ReceiptImage: string | null,
  receiptMimeType: string | null
): Promise<ExpenseAnalysisResult> => {
  
  const parts: Part[] = [];
  let receiptDescriptionForPrompt: string | undefined = undefined;

  if (base64ReceiptImage && receiptMimeType) {
    parts.push({
      inlineData: {
        mimeType: receiptMimeType,
        data: base64ReceiptImage,
      },
    });
    parts.push({ text: "The above image is the receipt for the expense described next. Please analyze it as part of your assessment." });
    receiptDescriptionForPrompt = "Receipt image provided and should be analyzed by AI.";
  } else {
     receiptDescriptionForPrompt = "No receipt image provided.";
  }

  const mainPrompt = constructPromptForAnalysis(expense, policies, receiptDescriptionForPrompt);
  parts.push({ text: mainPrompt });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: [{ parts: parts }],
      config: {
        systemInstruction: GEMINI_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const responseText = response.text;
    if (!responseText) {
        throw new Error("Received empty response from Gemini API for expense analysis.");
    }
    return parseGeminiAnalysisResponse(responseText);

  } catch (error: any) {
    console.error("Error calling Gemini API for expense analysis:", error);
    if (error.message && error.message.includes("429")) {
        throw new Error("API request limit reached. Please try again later or check your API quota. (Error 429)");
    }
    if (error.message && error.message.toLowerCase().includes("api key not valid")) {
        throw new Error("Invalid API Key. Please check your API_KEY environment variable. (Gemini API Error)");
    }
    throw new Error(`Failed to get analysis from AI: ${error.message || 'Unknown error during API call'}`);
  }
};

// For AI Assistant Chat
let assistantChatInstance: Chat | null = null;

const getOrCreateAssistantChat = (): Chat => {
  if (!assistantChatInstance) {
    const policiesText = COMPANY_POLICIES.map(p => `- ${p.description}${p.details ? ` (${p.details})` : ''}`).join('\n');
    const systemInstructionWithPolicies = `${GEMINI_CHAT_SYSTEM_INSTRUCTION}\n\nRelevant Company Policies you MUST refer to when applicable:\n${policiesText}`;

    assistantChatInstance = ai.chats.create({
      model: GEMINI_MODEL_NAME, // Ensure this model is suitable for chat
      config: {
        systemInstruction: systemInstructionWithPolicies,
        temperature: 0.7, // Slightly higher temperature for more conversational responses
      }
    });
  }
  return assistantChatInstance;
};

export const sendMessageToAssistant = async (message: string): Promise<string> => {
  const chat = getOrCreateAssistantChat();
  try {
    // The Chat object from SDK automatically manages history for subsequent sendMessage calls.
    const response: GenerateContentResponse = await chat.sendMessage({ message }); 
    const responseText = response.text;
    if (!responseText) {
        throw new Error("Received empty response from AI Assistant.");
    }
    return responseText;
  } catch (error: any) {
    console.error("Error sending message to AI Assistant:", error);
    // Optionally, reset assistantChatInstance on specific errors if needed
    // e.g., if (error.status === 401 || error.status === 403) assistantChatInstance = null;
    throw new Error(`AI Assistant failed to respond: ${error.message || 'Unknown error'}`);
  }
};