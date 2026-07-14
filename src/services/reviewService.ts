import { api, getApiErrorMessage } from "@/lib/api";
import type { Review } from "@/types/reviews";

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

export async function createReview(payload: CreateReviewPayload): Promise<ReviewResponse> {
  try {
    const { data } = await api.post<ReviewResponse>("/api/reviews/", {
      choreographyId: payload.choreographyId,
      rating: payload.rating,
      comment: payload.comment,
    });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo guardar la review"));
  }
}

export async function updateReview(reviewId: string, payload: Pick<CreateReviewPayload, 'rating' | 'comment'>): Promise<ReviewResponse> {
  try {
    const { data } = await api.patch<ReviewResponse>(`/api/reviews/${reviewId}/`, payload);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo actualizar la review"));
  }
}

export async function getReviews(choreographyId?: string): Promise<ReviewResponse[]> {
  try {
    const params = new URLSearchParams();
    if (choreographyId) {
      params.set("choreographyId", choreographyId);
    }
    const query = params.toString();
    const { data } = await api.get<ReviewResponse[]>(`/api/reviews/${query ? `?${query}` : ""}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudieron cargar las reviews"));
  }
}
