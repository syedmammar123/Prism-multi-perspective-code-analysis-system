import { runAgent } from '../../agents/runner';
import { SECURITY_AGENT_SYSTEM_PROMPT } from '../../prompts/security';
import { StateAnnotation } from '../state';

export async function agentSecurityNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  const securityReview = await runAgent(
    SECURITY_AGENT_SYSTEM_PROMPT,
    state.fileChunks
  );
  return { securityReview };
}
