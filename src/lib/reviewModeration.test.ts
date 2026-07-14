import { beforeEach, describe, expect, it } from "vitest";
import {
  defaultReviewModerationState,
  getReviewModerationState,
  getReviewStatus,
  setReviewModerationState,
  type ReviewModerationStatus,
} from "./reviewModeration";
import type { Review } from "@/types/reviews";

describe("review moderation helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns a default moderation state when no value exists", () => {
    expect(getReviewModerationState()).toEqual(defaultReviewModerationState);
  });

  it("persists and reads moderation state for a review", () => {
    const reviewId = "review-1";
    const status: ReviewModerationStatus = "pending";

    setReviewModerationState(reviewId, status);

    expect(getReviewModerationState()[reviewId]).toBe(status);
  });

  it("uses approved status by default for reviews without explicit moderation state", () => {
    const review: Review = {
      id: "review-2",
      userName: "Ana",
      comment: "Muy buena",
      rating: 5,
      createdAt: "2026-07-12T00:00:00.000Z",
    };

    expect(getReviewStatus(review)).toBe("approved");
  });
});
