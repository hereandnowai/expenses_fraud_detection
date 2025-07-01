
export enum RiskScore {
  Low = "Low",
  Medium = "Medium",
  High = "High",
  Unknown = "Unknown"
}

export enum ExpenseCategory {
  Travel = "Travel",
  Meals = "Meals",
  OfficeSupplies = "Office Supplies", // Changed from "Supplies"
  Software = "Software",
  Hardware = "Hardware",
  Training = "Training",
  Entertainment = "Entertainment",
  Utilities = "Utilities",
  Marketing = "Marketing",
  LegalFees = "Legal Fees",
  ConsultingFees = "Consulting Fees",
  Subscriptions = "Subscriptions",
  Other = "Other"
}

export interface PolicyViolation {
  policy: string;
  details: string;
}

export interface Anomaly {
  anomaly: string;
  details: string;
}

export interface SuspiciousLanguageAnalysis {
  detected: boolean;
  notes: string;
}

export interface ExpenseAnalysisResult {
  riskScore: RiskScore;
  isFlagged: boolean;
  summary: string;
  policyViolations: PolicyViolation[];
  anomaliesDetected: Anomaly[];
  suspiciousLanguage: SuspiciousLanguageAnalysis;
  recommendedAction: string;
}

export interface ExpenseReportEntry {
  id: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  amount: number;
  currency: string;
  vendor: string;
  category: ExpenseCategory;
  description: string;
  receiptImageName?: string;
  receiptImageDataUrl?: string; // Added to store full data URL for image download
  analysis: ExpenseAnalysisResult | null;
}

export interface CompanyPolicy {
  id: string;
  description: string;
  details?: string; // e.g., max amount for meals
}

// For Gemini API interactions
export interface GeminiAnalysisRequest {
  expense: Omit<ExpenseReportEntry, 'id' | 'analysis' | 'receiptImageName' | 'receiptImageDataUrl'> & { receiptDescription?: string };
  policies: CompanyPolicy[];
  historicalContext?: string; // e.g. "Average spend for this employee in this category is $X"
}

export interface GeminiResponseJson {
  riskScore: "Low" | "Medium" | "High";
  isFlagged: boolean;
  summary: string;
  policyViolations: Array<{ policy: string; details: string }>;
  anomaliesDetected: Array<{ anomaly: string; details: string }>;
  suspiciousLanguage: {
    detected: boolean;
    notes: string;
  };
  recommendedAction: string;
}

// For AI Assistant Chat
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  error?: boolean;
}
