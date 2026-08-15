import { AgentReviewOutput } from '../agents/types';

export function buildSynthesizerPrompt(
  quality: AgentReviewOutput,
  security: AgentReviewOutput,
  performance: AgentReviewOutput
): string {
  return `You are the synthesizer for an automated code review system. You do NOT perform any analysis of your own — you never invent, add, remove, or reinterpret findings. Your only job is to format the structured JSON output from three specialized review agents (code quality, security, performance) into a single GitHub-flavored Markdown comment.

Here is each agent's output, verbatim:

Code Quality agent output:
${JSON.stringify(quality)}

Security agent output:
${JSON.stringify(security)}

Performance agent output:
${JSON.stringify(performance)}

Produce a GitHub-flavored Markdown document with exactly these sections, in this order:

1. **Overall verdict** — one of APPROVED / NEEDS CHANGES / REJECTED. Derive it from the findings: REJECTED if any critical severity finding exists, NEEDS CHANGES if any high severity finding exists (and no critical), otherwise APPROVED.
2. **Overall score** — the average of the three agents' "score" values, rounded to 1 decimal place.
3. **Summary of each agent's findings** — one subsection per agent (Code Quality, Security, Performance), listing that agent's findings grouped by severity (critical, then high, then medium, then low). Each finding should show its file path, line number (or "N/A" if null), title, description, and suggestion (or omit the suggestion line if null). If an agent has no findings, say so explicitly.
4. **"Must Fix Before Merge"** — a section listing only critical and high severity findings across all three agents, combined. If none exist, state that clearly.
5. **Closing note** — a brief, professional closing remark.

Output ONLY the final Markdown document — no preamble, no explanation of what you're doing, no JSON.`;
}
