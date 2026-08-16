import { buildAgentFailureFallback, runAgent } from '../../agents/runner';
import { logger } from '../../lib/logger';
import { SECURITY_AGENT_SYSTEM_PROMPT } from '../../prompts/security';
import { StateAnnotation } from '../state';

export async function agentSecurityNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  try {
    const securityReview = await runAgent(
      SECURITY_AGENT_SYSTEM_PROMPT,
      state.fileChunks,
      state.guidelines
    );
    return { securityReview };
  } catch (err) {
    logger.error({ err, prNumber: state.prNumber }, 'security agent node failed');
    return {
      securityReview: buildAgentFailureFallback(
        `Security agent failed to run: ${(err as Error).message}`
      ),
    };
  }
}
