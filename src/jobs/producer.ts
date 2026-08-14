import { Queue } from 'bullmq';
import { connection } from './connection';

export interface ReviewJobPayload {
  prNumber: number;
  repoOwner: string;
  repoName: string;
}

export const reviewQueue = new Queue<ReviewJobPayload>('review-jobs', {
  connection,
});

export async function addReviewJob(payload: ReviewJobPayload) {
  return reviewQueue.add('review', payload);
}
