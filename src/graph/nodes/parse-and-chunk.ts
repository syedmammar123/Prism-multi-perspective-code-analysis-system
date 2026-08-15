import { parseDiff } from '../../integrations/github/diff-parser';
import { StateAnnotation } from '../state';

export async function parseAndChunkNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  const fileChunks = parseDiff(state.rawDiff ?? '');
  return { fileChunks };
}
