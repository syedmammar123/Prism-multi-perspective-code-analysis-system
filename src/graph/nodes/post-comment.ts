import { postReviewComment } from '../../integrations/github/commenter';
import { logger } from '../../lib/logger';
import { updateReview } from '../../repositories/review.repository';
import { StateAnnotation } from '../state';

export async function postCommentNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
  try {
    const result = await postReviewComment(
      state.repoOwner,
      state.repoName,
      state.prNumber,
      state.finalReview ?? ''
    );

    await updateReview(state.repoOwner, state.repoName, state.prNumber, {
      commentId: result.commentId,
      commentPosted: true,
      status: 'COMPLETED',
      overallScore: state.overallScore,
      verdict: state.verdict,
      completedAt: new Date(),
    });

    return { commentId: result.commentId };
  } catch (err) {
    logger.error(
      { err, prNumber: state.prNumber },
      'failed to post review comment after retries'
    );

    await updateReview(state.repoOwner, state.repoName, state.prNumber, {
      commentPosted: false,
      status: 'COMPLETED',
      overallScore: state.overallScore,
      verdict: state.verdict,
      completedAt: new Date(),
    });

    return { commentId: null };
  }
}
