export type UserStatus = "pending" | "approved" | "rejected";
export type UserRole = "user" | "admin";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  status: UserStatus;
  role: UserRole;
  dailyLimit: number;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export type RequestStatus = "processing" | "completed" | "failed";

export interface AnalysisRequest {
  id: string;
  userId: string;
  userEmail: string;
  ticker: string;
  mode: AnalysisMode;
  status: RequestStatus;
  reportUrl: string | null;
  reportFilename: string | null;
  errorDetail: string | null;
  createdAt: Date | null;
  completedAt: Date | null;
}

export type AnalysisMode =
  | "full_report"
  | "risk_analysis"
  | "valuation"
  | "peer_comparison"
  | "buffett_audit";

export const MODE_INFO: Record<AnalysisMode, { label: string; description: string }> = {
  full_report: {
    label: "Full Report",
    description: "Comprehensive research — financials, docs, valuation, risks",
  },
  risk_analysis: {
    label: "Risk Analysis",
    description: "Risk-focused — debt, earnings quality, promoter behavior",
  },
  valuation: {
    label: "Valuation",
    description: "Valuation deep-dive — historical multiples, DCF, peer multiples",
  },
  peer_comparison: {
    label: "Peer Comparison",
    description: "Peer benchmarking — rank vs sector on key metrics",
  },
  buffett_audit: {
    label: "Buffett Audit",
    description: "10-year management audit — promises vs delivery, moat, capital allocation",
  },
};

export const ALL_MODES: AnalysisMode[] = [
  "full_report",
  "risk_analysis",
  "valuation",
  "peer_comparison",
  "buffett_audit",
];
