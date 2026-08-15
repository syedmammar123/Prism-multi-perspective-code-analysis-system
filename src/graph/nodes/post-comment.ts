import { postReviewComment } from '../../integrations/github/commenter';
import { updateReview } from '../../repositories/review.repository';
import { StateAnnotation } from '../state';

export async function postCommentNode(
  state: typeof StateAnnotation.State
): Promise<Partial<typeof StateAnnotation.State>> {
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
}
