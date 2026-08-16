import { FileChunk } from '../integrations/github/diff-parser';
import { GuidelineMatch } from '../rag/retriever';
import { getLLMProvider } from '../llm/factory';
import { batchFileChunks, DEFAULT_MAX_TOKENS_PER_BATCH } from '../lib/chunk';
import { logger } from '../lib/logger';
import { parseAgentOutput } from './output-parser';
import { AgentReviewOutput, Finding, Severity } from './types';

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const AGENT_OUTPUT_SCHEMA = {
  score: 'number (1-10)',
  findings: [
    {
      filePath: 'string',
      lineNumber: 'number | null',
      severity: 'critical | high | medium | low',
      title: 'string',
      description: 'string',
      suggestion: 'string | null',
    },
  ],
};

const STRICTER_SUFFIX =
  '\n\nRespond with ONLY valid JSON matching the exact schema above, no markdown fences, no explanation text.';

function buildGuidelinesSection(guidelines: GuidelineMatch[]): string {
  if (guidelines.length === 0) {
    return '';
  }

  const body = guidelines
    .map((guideline) => `From ${guideline.fileName}:\n${guideline.content}`)
    .join('\n\n');

  return `## Team Coding Guidelines\n\nThe following are excerpts from this project's own coding conventions. Reference them specifically in your findings where relevant, instead of giving generic advice.\n\n${body}\n\n---\n\n`;
}

function buildUserPrompt(
  fileChunks: FileChunk[],
  guidelines: GuidelineMatch[]
): string {
  const diffSection = fileChunks
    .map((chunk) => `File: ${chunk.filePath}\n\n${chunk.content}`)
    .join('\n\n---\n\n');

  return `${buildGuidelinesSection(guidelines)}## Code Changes to Review\n\n${diffSection}`;
}

async function callAndParse(
  systemPrompt: string,
  userPrompt: string
): Promise<AgentReviewOutput> {
  const raw = await getLLMProvider().generateJSON<unknown>(
    systemPrompt,
    userPrompt,
    AGENT_OUTPUT_SCHEMA
  );
  return parseAgentOutput(JSON.stringify(raw));
}

export function buildAgentFailureFallback(reason: string): AgentReviewOutput {
  return {
    score: 0,
    failed: true,
    findings: [
      {
        filePath: 'unknown',
        lineNumber: null,
        severity: 'low',
        title: 'Agent failed to complete review',
        description: reason,
        suggestion: null,
      },
    ],
  };
}

async function runAgentBatch(
  systemPrompt: string,
  fileChunks: FileChunk[],
  guidelines: GuidelineMatch[]
): Promise<AgentReviewOutput> {
  const userPrompt = buildUserPrompt(fileChunks, guidelines);

  try {
    return await callAndParse(systemPrompt, userPrompt);
  } catch (firstErr) {
    try {
      return await callAndParse(systemPrompt + STRICTER_SUFFIX, userPrompt);
    } catch (secondErr) {
      return buildAgentFailureFallback(
        `The agent's response could not be parsed as valid structured output after 2 attempts. Last error: ${
          (secondErr as Error).message
        }`
      );
    }
  }
}

function dedupeFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  const deduped: Finding[] = [];

  for (const finding of findings) {
    const key = `${finding.filePath}::${finding.title.trim().toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(finding);
  }

  return deduped;
}

function mergeBatchResults(results: AgentReviewOutput[]): AgentReviewOutput {
  const allFindings = results.flatMap((r) => r.findings);
  const findings = dedupeFindings(allFindings).sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
  );
  const score = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const failed = results.some((r) => r.failed);

  return failed ? { score, findings, failed: true } : { score, findings };
}

export async function runAgent(
  systemPrompt: string,
  fileChunks: FileChunk[],
  guidelines: GuidelineMatch[] = []
): Promise<AgentReviewOutput> {
  const batches = batchFileChunks(fileChunks, DEFAULT_MAX_TOKENS_PER_BATCH);

  if (batches.length <= 1) {
    return runAgentBatch(systemPrompt, fileChunks, guidelines);
  }

  logger.info(
    { batchCount: batches.length, maxTokensPerBatch: DEFAULT_MAX_TOKENS_PER_BATCH },
    'splitting fileChunks into batches for agent run'
  );

  const results = await Promise.all(
    batches.map((batch) => runAgentBatch(systemPrompt, batch, guidelines))
  );

  return mergeBatchResults(results);
}
