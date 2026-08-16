import fs from 'fs';
import path from 'path';
import { embedText } from './embedder';
import { replaceGuidelineFile } from '../repositories/guideline.repository';

// Small enough that a chunk stays well within an embedding model's effective
// context window (a full section under a single heading is usually already
// well under this), only kicks in for unusually long sections.
const MAX_CHUNK_CHARS = 1500;

function splitLongSection(section: string): string[] {
  if (section.length <= MAX_CHUNK_CHARS) {
    return [section];
  }

  const paragraphs = section.split(/\n{2,}/);
  const chunks: string[] = [];
  let buffer = '';

  for (const paragraph of paragraphs) {
    const candidate = buffer ? `${buffer}\n\n${paragraph}` : paragraph;
    if (candidate.length > MAX_CHUNK_CHARS && buffer) {
      chunks.push(buffer);
      buffer = paragraph;
    } else {
      buffer = candidate;
    }
  }

  if (buffer) {
    chunks.push(buffer);
  }

  return chunks;
}

export function chunkMarkdown(content: string): string[] {
  const sections = content
    .split(/(?=^#{1,6}\s)/m)
    .map((section) => section.trim())
    .filter(Boolean);

  const normalized = sections.length > 0 ? sections : [content.trim()];

  return normalized.flatMap(splitLongSection).filter(Boolean);
}

export async function ingestGuidelineFile(
  fileName: string,
  content: string
): Promise<number> {
  const chunks = chunkMarkdown(content);

  const embeddedChunks = await Promise.all(
    chunks.map(async (chunkContent, chunkIndex) => ({
      chunkIndex,
      content: chunkContent,
      embedding: await embedText(chunkContent),
    }))
  );

  await replaceGuidelineFile(fileName, embeddedChunks);

  return embeddedChunks.length;
}

export interface IngestSummary {
  filesProcessed: number;
  chunksStored: number;
}

export async function ingestAllGuidelines(
  guidelinesDir: string
): Promise<IngestSummary> {
  const fileNames = fs
    .readdirSync(guidelinesDir)
    .filter((name) => name.endsWith('.md'));

  let chunksStored = 0;

  for (const fileName of fileNames) {
    const content = fs.readFileSync(
      path.join(guidelinesDir, fileName),
      'utf-8'
    );
    chunksStored += await ingestGuidelineFile(fileName, content);
  }

  return { filesProcessed: fileNames.length, chunksStored };
}
