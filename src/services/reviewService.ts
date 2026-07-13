import { api, getApiErrorMessage } from "@/lib/api";
import type { Review } from "@/types/reviews";

export interface CreateReviewPayload {
  rating: number;
  comment: string;
}

export interface ReviewResponse {
  id: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt: string;
}

export async function createReview(payload: CreateReviewPayload): Promise<ReviewResponse> {
  try {
    const { data } = await api.post<ReviewResponse>("/api/reviews/", payload);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo guardar la review"));
  }
}

export async function getReviews(): Promise<ReviewResponse[]> {
  try {
    const { data } = await api.get<ReviewResponse[]>("/api/reviews/");
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudieron cargar las reviews"));
  }
}
