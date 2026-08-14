import { Request, Response } from 'express';
import { verifySignature } from '../../lib/hmac';
import { config } from '../../config';
import { logger } from '../../lib/logger';
import { addReviewJob } from '../../jobs/producer';

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

  await addReviewJob({
    prNumber: pullRequest.number,
    repoOwner: repository.owner.login,
    repoName: repository.name,
  });

  // TODO: idempotency check once repositories/review.repository.ts exists

  res.status(202).end();
}
