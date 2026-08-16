import { buildAgentFailureFallback, runAgent } from '../../agents/runner';
import { logger } from '../../lib/logger';
import { PERFORMANCE_AGENT_SYSTEM_PROMPT } from '../../prompts/performance';
import { StateAnnotation } from '../state';

export async function agentPerformanceNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  try {
    const performanceReview = await runAgent(
      PERFORMANCE_AGENT_SYSTEM_PROMPT,
      state.fileChunks,
      state.guidelines
    );
    return { performanceReview };
  } catch (err) {
    logger.error({ err, prNumber: state.prNumber }, 'performance agent node failed');
    return {
      performanceReview: buildAgentFailureFallback(
        `Performance agent failed to run: ${(err as Error).message}`
      ),
    };
  }
}
