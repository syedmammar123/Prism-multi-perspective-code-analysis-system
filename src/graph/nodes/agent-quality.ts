import { runAgent } from '../../agents/runner';
import { QUALITY_AGENT_SYSTEM_PROMPT } from '../../prompts/quality';
import { StateAnnotation } from '../state';

export async function agentQualityNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  const qualityReview = await runAgent(
    QUALITY_AGENT_SYSTEM_PROMPT,
    state.fileChunks
  );
  return { qualityReview };
}
