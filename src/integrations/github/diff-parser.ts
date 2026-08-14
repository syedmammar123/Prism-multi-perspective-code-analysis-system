export interface FileChunk {
  filePath: string;
  content: string;
  lineStart: number;
  lineEnd: number;
}

const FILE_HEADER_RE = /^diff --git a\/(.+?) b\/(.+?)$/m;
const HUNK_HEADER_RE = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm;

export function parseDiff(rawDiff: string): FileChunk[] {
  const sections = rawDiff
    .split(/(?=^diff --git )/m)
    .map((section) => section.trim())
    .filter(Boolean);

  return sections.map((section) => {
    const headerMatch = section.match(FILE_HEADER_RE);
    const filePath = headerMatch ? headerMatch[2] : 'unknown';

    let lineStart = 0;
    let lineEnd = 0;
    let firstHunk = true;

    for (const hunkMatch of section.matchAll(HUNK_HEADER_RE)) {
      const start = Number(hunkMatch[1]);
      const count = hunkMatch[2] !== undefined ? Number(hunkMatch[2]) : 1;
      if (firstHunk) {
        lineStart = start;
        firstHunk = false;
      }
      lineEnd = start + Math.max(count - 1, 0);
    }

    return { filePath, content: section, lineStart, lineEnd };
  });
}
