import { FileChunk } from '../integrations/github/diff-parser';
import { embedText } from './embedder';
import {
  findRelevantGuidelines,
  GuidelineMatch,
} from '../repositories/guideline.repository';

export { GuidelineMatch };

const TOP_K = 3;
const MAX_QUERY_CHARS = 2000;

function buildQueryText(fileChunks: FileChunk[]): string {
  const filePaths = fileChunks.map((chunk) => chunk.filePath).join(', ');
  const contentSample = fileChunks
    .map((chunk) => chunk.content)
    .join('\n')
    .slice(0, MAX_QUERY_CHARS);

  return `Files changed: ${filePaths}\n\n${contentSample}`;
}

export async function retrieveGuidelines(
  fileChunks: FileChunk[]
): Promise<GuidelineMatch[]> {
  if (fileChunks.length === 0) {
    return [];
  }

  const queryText = buildQueryText(fileChunks);
  const queryEmbedding = await embedText(queryText);

  return findRelevantGuidelines(queryEmbedding, TOP_K);
}
