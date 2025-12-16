export interface SecurityFinding {
  severity: "HIGH" | "MEDIUM" | "LOW";
  issue_type: string;
  location: string;
  description: string;
  recommendation: string;
}

export interface PerformanceIssue {
  severity: "HIGH" | "MEDIUM" | "LOW";
  issue_type: string;
  location: string;
  description: string;
  improvement: string;
}

export interface QualityIssue {
  category: "readability" | "maintainability" | "documentation";
  location: string;
  description: string;
  suggestion: string;
}

export interface CodeReviewReport {
  overall_score: number;
  security_findings: SecurityFinding[];
  performance_issues: PerformanceIssue[];
  quality_issues: QualityIssue[];
  summary: string;
  // Fixed type error: 'bool' is not a valid TypeScript type, changed to 'boolean'
  approved: boolean;
}

export enum AgentStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface AgentState {
  id: 'security' | 'performance' | 'quality';
  name: string;
  status: AgentStatus;
  description: string;
  findingsCount: number;
}