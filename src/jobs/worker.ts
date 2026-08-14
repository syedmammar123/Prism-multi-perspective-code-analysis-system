import { Worker } from 'bullmq';
import { connection } from './connection';
import { logger } from '../lib/logger';
import type { ReviewJobPayload } from './producer';
import { fetchPullRequest } from '../integrations/github/client';
import { parseDiff } from '../integrations/github/diff-parser';

const worker = new Worker<ReviewJobPayload>(
  'review-jobs',
  async (job) => {
    const { prNumber, repoOwner, repoName } = job.data;

    try {
      const { title, author, diff } = await fetchPullRequest(
        repoOwner,
        repoName,
        prNumber
      );
      const files = parseDiff(diff);

      logger.info(
        {
          prNumber,
          repoOwner,
          repoName,
          title,
          author,
          files: files.map((f) => f.filePath),
        },
        'fetched PR diff'
      );
    } catch (err) {
      logger.error(
        { err, prNumber, repoOwner, repoName },
        'failed to fetch PR diff'
      );
      throw err;
    }
  },
  { connection }
);

worker.on('ready', () => {
  logger.info('worker ready, listening for review jobs');
});
