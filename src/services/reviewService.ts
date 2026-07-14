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
  reviewStatus: "pending" | "approved" | "rejected";
  isPublic: boolean;
  moderation_note?: string | null;
  reviewed_at?: string | null;
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

export async function getReviews(choreographyId?: string, includeAll = false): Promise<ReviewResponse[]> {
  try {
    const params = new URLSearchParams();
    if (choreographyId) {
      params.set("choreographyId", choreographyId);
    }
    if (includeAll) {
      params.set("status", "pending");
    }
    const query = params.toString();
    const { data } = await api.get<ReviewResponse[]>(`/api/reviews/${query ? `?${query}` : ""}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudieron cargar las reviews"));
  }
}

export async function approveReview(reviewId: string): Promise<ReviewResponse> {
  const { data } = await api.post<ReviewResponse>(`/api/reviews/${reviewId}/approve/`);
  return data;
}

export async function rejectReview(reviewId: string): Promise<ReviewResponse> {
  const { data } = await api.post<ReviewResponse>(`/api/reviews/${reviewId}/reject/`);
  return data;
}
