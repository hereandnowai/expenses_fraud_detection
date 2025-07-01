import { CompanyPolicy, ExpenseCategory } from './types';

export const GEMINI_MODEL_NAME = "gemini-2.5-flash-preview-04-17"; // General text and multimodal
// For image generation, if needed: export const IMAGEN_MODEL_NAME = "imagen-3.0-generate-002";

export const COMPANY_POLICIES: CompanyPolicy[] = [
  { id: "MEAL_LIMIT", description: "Max meal expense per person: $75.", details: "Applies to individual meals unless client entertainment with prior approval." },
  { id: "TRAVEL_CLASS", description: "Travel: Economy class flights for domestic, Premium Economy for international flights over 6 hours.", details: "Business class requires VP approval." },
  { id: "GIFTS_GOVT", description: "No gifts to government officials or their families.", details: "Strictly prohibited." },
  { id: "ALCOHOL", description: "Alcohol: Generally not reimbursable.", details: "Reimbursable only for pre-approved client entertainment events with itemized receipts." },
  { id: "UNUSUAL_HOURS", description: "Expenses submitted for activities occurring between 10 PM and 6 AM local time require additional justification.", details: "Clearly state business purpose for off-hours activity." },
  { id: "VENDOR_FREQUENCY", description: "More than 3 claims from the same non-contracted vendor in a single month for amounts over $100 each may be flagged.", details: "Consider preferred vendors or bulk purchasing." },
  { id: "RECEIPT_REQUIRED", description: "Receipts required for all expenses over $25.", details: "Must be itemized and legible." },
  { id: "EXPENSE_TIMELINESS", description: "Expenses should be submitted within 30 days of incurring the cost.", details: "Late submissions require manager approval."}
];

export const DEFAULT_CURRENCY = "USD";

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.Travel,
  ExpenseCategory.Meals,
  ExpenseCategory.OfficeSupplies,
  ExpenseCategory.Software,
  ExpenseCategory.Hardware,
  ExpenseCategory.Training,
  ExpenseCategory.Entertainment,
  ExpenseCategory.Utilities,
  ExpenseCategory.Marketing,
  ExpenseCategory.LegalFees,
  ExpenseCategory.ConsultingFees,
  ExpenseCategory.Subscriptions,
  ExpenseCategory.Other,
];

export const COMPANY_LOGO_URL = "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/HNAI%20Fevicon%20-Teal%20%26%20Golden%20Logo%20-%20DESIGN%203%20-%20Raj-03.png";
export const COMPANY_NAME = "HERE AND NOW-AI RESEARCH INSTITUTE";
export const COMPANY_IMAGE_URL = "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/HNAI%20Title%20-Teal%20%26%20Golden%20Logo%20-%20DESIGN%203%20-%20Raj-07.png";

export const GEMINI_SYSTEM_INSTRUCTION = `You are an AI assistant specialized in detecting fraud and policy violations in corporate expense reports.
Your tasks are to analyze submitted expense reports, identify anomalies or suspicious activities, verify supporting documents (if provided), and generate clear, actionable summaries for reviewers.
When a receipt image is provided, analyze it for details like date, amount, vendor, and items purchased, and compare them with the reported expense. Flag if the receipt appears altered, duplicated, or inconsistent.
Analyze expense data for the employee, comparing to typical business practices to identify unusual or suspicious behavior (e.g., unusually high amounts, frequent claims from the same vendor, expenses outside business hours, or claims from unexpected locations).
Check each expense against the provided company policies. Flag any expenses that violate these policies.
Review text descriptions and justifications for suspicious language or inconsistencies. Extract key entities and analyze sentiment to detect evasive or unusual tones.
Assign a risk score to each expense based on anomaly detection, receipt verification (if applicable), and policy compliance.
For every flagged entry, provide a clear explanation of why it was flagged, referencing the specific anomalies or policy violations detected.
Respond ONLY with a JSON object adhering to the specified structure. Do not include any explanatory text before or after the JSON object itself. The JSON should be directly parsable.`;

export const GEMINI_RESPONSE_JSON_STRUCTURE = `
{
  "riskScore": "Low" | "Medium" | "High",
  "isFlagged": boolean,
  "summary": "Brief summary of findings, including key reasons for the risk score.",
  "policyViolations": [
    { "policy": "Description of violated policy (from provided list or general business practice if specific policy not listed but relevant)", "details": "How it was violated and specific part of expense" }
  ],
  "anomaliesDetected": [
    { "anomaly": "Description of anomaly (e.g., 'Unusually high amount for category', 'Expense outside business hours')", "details": "Supporting facts and comparison points if applicable" }
  ],
  "suspiciousLanguage": {
    "detected": boolean,
    "notes": "Observations on language or tone in the description, if any. Mention specific words or phrases if relevant."
  },
  "recommendedAction": "e.g., Approve, Request more documentation, Escalate for manual review, Deny claim"
}
`;

export const GEMINI_CHAT_SYSTEM_INSTRUCTION = `You are "App Guide", a friendly and helpful AI assistant for users of this Expense Reporting application.
Your primary role is to help users understand and navigate the features of this application.
You can explain:
- How to submit a new expense using the form.
- What information is needed for each field in the expense form.
- How to upload and manage receipt images (e.g., file types, size limits).
- How to view and understand the expense history.
- How to interpret the AI analysis results (risk scores, policy violations, anomalies) displayed for each expense.
- How to download PDF reports of their expenses.
- How to switch between light and dark themes using the theme toggle button.
- The purpose of different sections like the Summary Report on the 'Add Expense' and 'History' pages.
- How to clear expense history.

You also have access to the company's expense policies (as configured in this app) and can answer questions about them.
For example, "What is the meal limit according to company policy?" or "What are the rules for travel expenses?".

IMPORTANT:
- Do NOT attempt to perform actions for the user (e.g., "submit this expense for me" or "change my theme"). Instead, guide them on how THEY can do it using the application's interface. For instance, if asked to change theme, explain where the theme toggle button is located.
- Do NOT ask for or try to process specific expense amounts, dates, vendor names, or any personal identifiable information (PII) through this chat. Guide users to the main expense submission form for these actions.
- Keep your answers concise, clear, and focused on using THIS application.
- If a question is unrelated to this application or its expense policies (e.g., asking for personal opinions, non-expense related topics), politely state that you can only help with queries about this expense reporting app and its policies.
Be friendly and professional.`;
