import type { Octokit as OctokitType } from 'octokit';
import { config } from '../../config';

let octokitInstance: OctokitType | null = null;

export async function getOctokit(): Promise<OctokitType> {
  if (!octokitInstance) {
    const { Octokit } = await import('octokit');
    octokitInstance = new Octokit({ auth: config.github.token });
  }
  return octokitInstance;
}

export interface PullRequestData {
  title: string;
  author: string;
  diff: string;
}

export async function fetchPullRequest(
  owner: string,
  repo: string,
  prNumber: number
): Promise<PullRequestData> {
  const octokit = await getOctokit();

  const { data: pr } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });


  const { data: diff } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
    mediaType: { format: 'diff' },
  });

  return {
    title: pr.title,
    author: pr.user?.login ?? 'unknown',
    diff: diff as unknown as string,
  };
}
