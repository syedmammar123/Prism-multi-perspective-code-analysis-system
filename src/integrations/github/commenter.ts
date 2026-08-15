import { getOctokit } from './client';

export async function postReviewComment(
  owner: string,
  repo: string,
  prNumber: number,
  body: string
): Promise<{ commentId: string }> {
  const octokit = await getOctokit();

  const { data } = await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: prNumber,
    body,
  });

  return { commentId: String(data.id) };
}
