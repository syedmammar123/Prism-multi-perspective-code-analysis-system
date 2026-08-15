import { runAgent } from '../../agents/runner';
import { PERFORMANCE_AGENT_SYSTEM_PROMPT } from '../../prompts/performance';
import { StateAnnotation } from '../state';

export async function agentPerformanceNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  const performanceReview = await runAgent(
    PERFORMANCE_AGENT_SYSTEM_PROMPT,
    state.fileChunks
  );
  return { performanceReview };
}
