import { fetchPullRequest } from '../../integrations/github/client';
import { StateAnnotation } from '../state';

export async function fetchPrNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  const { title, author, diff } = await fetchPullRequest(
    state.repoOwner,
    state.repoName,
    state.prNumber
  );

  return { prTitle: title, prAuthor: author, rawDiff: diff };
}
