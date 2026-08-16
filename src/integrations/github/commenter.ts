import { retryWithBackoff } from '../../lib/retry';
import { getOctokit } from './client';

export async function postReviewComment(
  owner: string,
  repo: string,
  prNumber: number,
  body: string
): Promise<{ commentId: string }> {
  const octokit = await getOctokit();

  const { data } = await retryWithBackoff(
    () =>
      octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body,
      }),
    { maxAttempts: 3, baseDelayMs: 500 }
  );

  return { commentId: String(data.id) };
}
