import { retrieveGuidelines } from '../../rag/retriever';
import { StateAnnotation } from '../state';

export async function retrieveGuidelinesNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  const guidelines = await retrieveGuidelines(state.fileChunks);
  return { guidelines };
}
