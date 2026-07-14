import type { Review } from "@/types/reviews";

export type ReviewModerationStatus = "pending" | "approved" | "rejected";

export interface ReviewModerationState {
  [reviewId: string]: ReviewModerationStatus;
}

export const defaultReviewModerationState: ReviewModerationState = {};

const STORAGE_KEY = "danceflow_review_moderation";

function readStorage(): ReviewModerationState {
  if (typeof window === "undefined") {
    return defaultReviewModerationState;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return defaultReviewModerationState;
  }

  try {
    const parsed = JSON.parse(saved) as ReviewModerationState;
    return parsed && typeof parsed === "object" ? parsed : defaultReviewModerationState;
  } catch {
    return defaultReviewModerationState;
  }
}

function writeStorage(state: ReviewModerationState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getReviewModerationState(): ReviewModerationState {
  return readStorage();
}

export function setReviewModerationState(reviewId: string, status: ReviewModerationStatus) {
  const nextState = { ...readStorage(), [reviewId]: status };
  writeStorage(nextState);
  return nextState;
}

export function getReviewStatus(review: Review): ReviewModerationStatus {
  const state = getReviewModerationState();
  return state[review.id] ?? "approved";
}

export function getReviewStatusLabel(status: ReviewModerationStatus): string {
  switch (status) {
    case "pending":
      return "Pendiente de revisión";
    case "rejected":
      return "Rechazada";
    default:
      return "Aprobada";
  }
}

export function getReviewStatusTone(status: ReviewModerationStatus): string {
  switch (status) {
    case "pending":
      return "border-amber-300 bg-amber-50 text-amber-700";
    case "rejected":
      return "border-rose-300 bg-rose-50 text-rose-700";
    default:
      return "border-emerald-300 bg-emerald-50 text-emerald-700";
  }
}
