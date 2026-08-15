import { Worker } from 'bullmq';
import { connection } from './connection';
import { logger } from '../lib/logger';
import type { ReviewJobPayload } from './producer';
import { reviewGraph } from '../graph/builder';

const worker = new Worker<ReviewJobPayload>(
  'review-jobs',
  async (job) => {
    const { prNumber, repoOwner, repoName } = job.data;

    try {
      const result = await reviewGraph.invoke({ prNumber, repoOwner, repoName });

      logger.info(
        {
          prNumber,
          repoOwner,
          repoName,
          title: result.prTitle,
          verdict: result.verdict,
          overallScore: result.overallScore,
          commentId: result.commentId,
        },
        'review pipeline completed'
      );
    } catch (err) {
      logger.error(
        { err, prNumber, repoOwner, repoName },
        'review pipeline failed'
      );
      throw err;
    }
  },
  { connection }
);

worker.on('ready', () => {
  logger.info('worker ready, listening for review jobs');
});
