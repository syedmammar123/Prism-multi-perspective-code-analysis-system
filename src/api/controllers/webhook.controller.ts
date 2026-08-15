import { Request, Response } from 'express';
import { verifySignature } from '../../lib/hmac';
import { config } from '../../config';
import { logger } from '../../lib/logger';
import { addReviewJob } from '../../jobs/producer';
import { findReviewByPr, createReview } from '../../repositories/review.repository';

const HANDLED_ACTIONS = new Set(['opened', 'synchronize']);

export async function webhookController(req: Request, res: Response) {
  const signature = req.header('x-hub-signature-256');

  if (!signature || !req.rawBody) {
    logger.warn('Webhook rejected: missing signature or raw body');
    res.status(401).end();
    return;
  }

  if (!verifySignature(req.rawBody, signature, config.github.webhookSecret)) {
    logger.warn('Webhook rejected: signature mismatch');
    res.status(401).end();
    return;
  }

  const { action, pull_request: pullRequest, repository } = req.body;

  if (!HANDLED_ACTIONS.has(action)) {
    res.status(200).end();
    return;
  }

  const prNumber = pullRequest.number;
  const repoOwner = repository.owner.login;
  const repoName = repository.name;

  const existing = await findReviewByPr(repoOwner, repoName, prNumber);

  if (existing && (existing.status === 'QUEUED' || existing.status === 'PROCESSING')) {
    logger.info(
      { repoOwner, repoName, prNumber },
      'Duplicate webhook: review already in flight, skipping'
    );
    res.status(200).end();
    return;
  }

  await createReview({
    repoOwner,
    repoName,
    prNumber,
    prTitle: pullRequest.title,
    prAuthor: pullRequest.user.login,
  });

  await addReviewJob({ prNumber, repoOwner, repoName });

  res.status(202).end();
}
