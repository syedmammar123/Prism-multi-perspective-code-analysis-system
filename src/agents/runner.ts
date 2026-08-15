import { FileChunk } from '../integrations/github/diff-parser';
import { getLLMProvider } from '../llm/factory';
import { parseAgentOutput } from './output-parser';
import { AgentReviewOutput } from './types';

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

function buildUserPrompt(fileChunks: FileChunk[]): string {
  return fileChunks
    .map((chunk) => `File: ${chunk.filePath}\n\n${chunk.content}`)
    .join('\n\n---\n\n');
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

export async function runAgent(
  systemPrompt: string,
  fileChunks: FileChunk[]
): Promise<AgentReviewOutput> {
  const userPrompt = buildUserPrompt(fileChunks);

  try {
    return await callAndParse(systemPrompt, userPrompt);
  } catch (firstErr) {
    try {
      return await callAndParse(systemPrompt + STRICTER_SUFFIX, userPrompt);
    } catch (secondErr) {
      return {
        score: 0,
        findings: [
          {
            filePath: 'unknown',
            lineNumber: null,
            severity: 'low',
            title: "Agent output couldn't be parsed",
            description: `The agent's response could not be parsed as valid structured output after 2 attempts. Last error: ${
              (secondErr as Error).message
            }`,
            suggestion: null,
          },
        ],
      };
    }
  }
}
