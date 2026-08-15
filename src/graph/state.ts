import { Annotation } from '@langchain/langgraph';
import { FileChunk } from '../integrations/github/diff-parser';
import { AgentReviewOutput } from '../agents/types';

export const StateAnnotation = Annotation.Root({
  // Input (set by webhook handler / caller)
  prNumber: Annotation<number>,
  repoOwner: Annotation<string>,
  repoName: Annotation<string>,

  // Set by fetch-pr node
  prTitle: Annotation<string | null>,
  prAuthor: Annotation<string | null>,
  rawDiff: Annotation<string | null>,

  // Set by parse-and-chunk node
  fileChunks: Annotation<FileChunk[]>,

  // Set by agents (Task 15 — each writes only its own key)
  qualityReview: Annotation<AgentReviewOutput | null>,
  securityReview: Annotation<AgentReviewOutput | null>,
  performanceReview: Annotation<AgentReviewOutput | null>,

  // Set by synthesizer (Task 16)
  finalReview: Annotation<string | null>,
  overallScore: Annotation<number | null>,
  verdict: Annotation<string | null>,

  // Set by post-comment node (Task 17)
  commentId: Annotation<string | null>,
});
