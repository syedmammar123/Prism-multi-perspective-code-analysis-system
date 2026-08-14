import { Worker } from 'bullmq';
import { connection } from './connection';
import { logger } from '../lib/logger';
import type { ReviewJobPayload } from './producer';

const worker = new Worker<ReviewJobPayload>(
  'review-jobs',
  async (job) => {
    logger.info({ payload: job.data }, 'received review job');
  },
  { connection }
);

worker.on('ready', () => {
  logger.info('worker ready, listening for review jobs');
});
