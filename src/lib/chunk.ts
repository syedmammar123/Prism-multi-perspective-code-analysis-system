import { FileChunk } from '../integrations/github/diff-parser';

/**
  Groq's free-tier tokens-per-minute budget sits well below the model's advertised context  window, and every batch also needs headroom for the system prompt, RAG guidelines, and the requested JSON output. 8000 tokens (~32k characters of diff) keeps batches small enough to avoid the "lost in the middle" quality drop on large diffs, while staying large enough that the common case (a handful of changed files) never splits. **/

export const DEFAULT_MAX_TOKENS_PER_BATCH = 8000;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function splitOversizedChunk(
  chunk: FileChunk,
  maxTokensPerBatch: number
): FileChunk[] {
  const lines = chunk.content.split('\n');
  const pieces: FileChunk[] = [];
  let buffer: string[] = [];
  let bufferTokens = 0;
  let lastBoundaryIdx = -1; // index within buffer of the last blank/@@ line

  const flushUpTo = (idx: number) => {
    const piece = buffer.slice(0, idx + 1);
    pieces.push({
      filePath: chunk.filePath,
      content: piece.join('\n'),
      lineStart: chunk.lineStart,
      lineEnd: chunk.lineEnd,
    });
    buffer = buffer.slice(idx + 1);
    bufferTokens = buffer.reduce((sum, l) => sum + estimateTokens(l) + 1, 0);
    lastBoundaryIdx = -1;
  };

  for (const line of lines) {
    const lineTokens = estimateTokens(line) + 1; // +1 for the stripped '\n'

    if (bufferTokens + lineTokens > maxTokensPerBatch && buffer.length > 0) {
      // Prefer cutting at the last blank line / @@ hunk boundary seen so
      // far; if none exists in the buffer, hard-cut here so the budget
      // invariant always holds even without a natural break point.
      flushUpTo(lastBoundaryIdx >= 0 ? lastBoundaryIdx : buffer.length - 1);
    }

    buffer.push(line);
    bufferTokens += lineTokens;
    if (line.trim() === '' || line.startsWith('@@')) {
      lastBoundaryIdx = buffer.length - 1;
    }
  }

  if (buffer.length > 0) {
    pieces.push({
      filePath: chunk.filePath,
      content: buffer.join('\n'),
      lineStart: chunk.lineStart,
      lineEnd: chunk.lineEnd,
    });
  }

  return pieces;
}

export function batchFileChunks(
  chunks: FileChunk[],
  maxTokensPerBatch: number
): FileChunk[][] {
  const normalized = chunks.flatMap((chunk) =>
    estimateTokens(chunk.content) > maxTokensPerBatch
      ? splitOversizedChunk(chunk, maxTokensPerBatch)
      : [chunk]
  );

  const batches: FileChunk[][] = [];
  let currentBatch: FileChunk[] = [];
  let currentTokens = 0;

  for (const chunk of normalized) {
    const chunkTokens = estimateTokens(chunk.content);

    if (currentBatch.length > 0 && currentTokens + chunkTokens > maxTokensPerBatch) {
      batches.push(currentBatch);
      currentBatch = [];
      currentTokens = 0;
    }

    currentBatch.push(chunk);
    currentTokens += chunkTokens;
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch);
  }

  return batches;
}
