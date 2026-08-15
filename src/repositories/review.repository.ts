import { prisma } from '../lib/prisma';
import { ReviewStatus } from '@prisma/client';

export async function findReviewByPr(
  repoOwner: string,
  repoName: string,
  prNumber: number
) {
  return prisma.review.findUnique({
    where: {
      repoOwner_repoName_prNumber: {
        repoOwner,
        repoName,
        prNumber,
      },
    },
  });
}

export async function createReview(data: {
  repoOwner: string;
  repoName: string;
  prNumber: number;
  prTitle: string;
  prAuthor: string;
}) {
  const { repoOwner, repoName, prNumber, prTitle, prAuthor } = data;

  return prisma.review.upsert({
    where: {
      repoOwner_repoName_prNumber: { repoOwner, repoName, prNumber },
    },
    create: {
      repoOwner,
      repoName,
      prNumber,
      prTitle,
      prAuthor,
      status: 'QUEUED',
    },
    update: {
      prTitle,
      prAuthor,
      status: 'QUEUED',
      overallScore: null,
      verdict: null,
      commentId: null,
      commentPosted: false,
      rawDiff: null,
      completedAt: null,
    },
  });
}

export async function updateReview(
  repoOwner: string,
  repoName: string,
  prNumber: number,
  data: {
    commentId?: string;
    commentPosted?: boolean;
    status?: ReviewStatus;
    overallScore?: number | null;
    verdict?: string | null;
    completedAt?: Date | null;
  }
) {
  return prisma.review.update({
    where: {
      repoOwner_repoName_prNumber: { repoOwner, repoName, prNumber },
    },
    data,
  });
}
