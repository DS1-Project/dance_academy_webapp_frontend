import type { BackendReview } from "@/types/backend";
import type { Review } from "@/types/reviews";
import {
  createChoreographyReview,
  getChoreographyReviews,
} from "@/services/choreographyService";

export interface CreateReviewPayload {
  choreographyId: string;
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: string;
  choreographyId: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt: string;
  isOwner: boolean;
}

function mapReview(review: BackendReview, currentUserId?: string): ReviewResponse {
  return {
    id: review.id,
    choreographyId: review.choreography,
    userName: review.client_name || review.client_email,
    comment: review.comment ?? "",
    rating: review.rating,
    createdAt: review.created_at,
    isOwner: currentUserId ? review.client === currentUserId : false,
  };
}

export async function createReview(payload: CreateReviewPayload): Promise<ReviewResponse> {
  const review = await createChoreographyReview(payload.choreographyId, {
    rating: payload.rating,
    comment: payload.comment,
  });
  return mapReview(review);
}

/** El backend no expone PATCH de review; se mantiene por compatibilidad de UI. */
export async function updateReview(
  _reviewId: string,
  _payload: Pick<CreateReviewPayload, "rating" | "comment">
): Promise<ReviewResponse> {
  throw new Error("La edición de reviews aún no está disponible en el backend.");
}

export async function getReviews(
  choreographyId?: string,
  currentUserId?: string
): Promise<ReviewResponse[]> {
  if (!choreographyId) return [];
  const reviews = await getChoreographyReviews(choreographyId);
  return reviews.map((r) => mapReview(r, currentUserId));
}

export function toUiReview(review: ReviewResponse): Review {
  return {
    id: review.id,
    userName: review.userName,
    comment: review.comment,
    rating: review.rating,
    createdAt: review.createdAt,
    choreographyId: review.choreographyId,
    isOwner: review.isOwner,
  };
}
