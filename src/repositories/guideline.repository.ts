import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma';

export interface GuidelineChunkInput {
  chunkIndex: number;
  content: string;
  embedding: number[];
}

export interface GuidelineMatch {
  fileName: string;
  content: string;
}

export async function replaceGuidelineFile(
  fileName: string,
  chunks: GuidelineChunkInput[]
) {
  await prisma.$transaction([
    prisma.guideline.deleteMany({ where: { fileName } }),
    ...chunks.map(({ chunkIndex, content, embedding }) => {
      const vectorLiteral = `[${embedding.join(',')}]`;
      return prisma.$executeRaw`
        INSERT INTO "guidelines" ("id", "fileName", "chunkIndex", "content", "embedding")
        VALUES (${randomUUID()}, ${fileName}, ${chunkIndex}, ${content}, ${vectorLiteral}::vector)
      `;
    }),
  ]);
}

export async function findRelevantGuidelines(
  embedding: number[],
  topK: number
): Promise<GuidelineMatch[]> {
  const vectorLiteral = `[${embedding.join(',')}]`;
  return prisma.$queryRaw<GuidelineMatch[]>`
    SELECT "fileName", "content"
    FROM "guidelines"
    ORDER BY "embedding" <=> ${vectorLiteral}::vector
    LIMIT ${topK}
  `;
}
