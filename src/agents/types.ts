export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface Finding {
  filePath: string;
  lineNumber: number | null;
  severity: Severity;
  title: string;
  description: string;
  suggestion: string | null;
}

export interface AgentReviewOutput {
  score: number;
  findings: Finding[];
}
