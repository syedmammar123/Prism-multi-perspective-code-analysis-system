import { AgentOutputError } from '../lib/errors';
import { AgentReviewOutput, Finding, Severity } from './types';

const VALID_SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];

function isValidFinding(value: unknown): value is Finding {
  if (typeof value !== 'object' || value === null) return false;
  const f = value as Record<string, unknown>;
  return (
    typeof f.filePath === 'string' &&
    (typeof f.lineNumber === 'number' || f.lineNumber === null) &&
    typeof f.severity === 'string' &&
    VALID_SEVERITIES.includes(f.severity as Severity) &&
    typeof f.title === 'string' &&
    typeof f.description === 'string' &&
    (typeof f.suggestion === 'string' || f.suggestion === null)
  );
}

export function parseAgentOutput(raw: string): AgentReviewOutput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw AgentOutputError(
      `Agent output is not valid JSON: ${(err as Error).message}`
    );
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw AgentOutputError('Agent output is not a JSON object');
  }

  const { score, findings } = parsed as Record<string, unknown>;

  if (typeof score !== 'number') {
    throw AgentOutputError('Agent output is missing a numeric "score"');
  }
  if (!Array.isArray(findings) || !findings.every(isValidFinding)) {
    throw AgentOutputError(
      'Agent output "findings" is not an array of valid Finding objects'
    );
  }

  return { score, findings };
}
