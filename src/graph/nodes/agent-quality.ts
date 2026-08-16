import { buildAgentFailureFallback, runAgent } from '../../agents/runner';
import { logger } from '../../lib/logger';
import { QUALITY_AGENT_SYSTEM_PROMPT } from '../../prompts/quality';
import { StateAnnotation } from '../state';

export async function agentQualityNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  try {
    const qualityReview = await runAgent(
      QUALITY_AGENT_SYSTEM_PROMPT,
      state.fileChunks,
      state.guidelines
    );
    return { qualityReview };
  } catch (err) {
    logger.error({ err, prNumber: state.prNumber }, 'quality agent node failed');
    return {
      qualityReview: buildAgentFailureFallback(
        `Quality agent failed to run: ${(err as Error).message}`
      ),
    };
  }
}
