import { describe, expect, it } from "vitest";
import {
  estimateCompletionRate,
  estimatePlaybackMinutes,
  mapBackendChoreographyToCard,
  mapDifficultyFromBackend,
  mapDifficultyToBackend,
} from "@/lib/choreographyMapper";
import type { BackendChoreography } from "@/types/backend";

describe("choreographyMapper", () => {
  it("maps backend difficulty labels", () => {
    expect(mapDifficultyFromBackend("beginner")).toBe("Principiante");
    expect(mapDifficultyToBackend("Avanzado")).toBe("advanced");
  });

  it("maps a backend choreography to catalog card shape including guests", () => {
    const backend: BackendChoreography = {
      id: "c-1",
      title: "Despacito Remix",
      description: "Clase intro",
      difficulty_level: "beginner",
      thumbnail_url: "https://example.com/thumb.jpg",
      is_approved: true,
      created_at: "2026-01-01T00:00:00Z",
      main_teacher: {
        id: "t1",
        email: "maria@test.com",
        first_name: "María",
        last_name: "García",
      },
      guest_teachers: [
        {
          id: "t2",
          email: "carlos@test.com",
          first_name: "Carlos",
          last_name: "Fuentes",
        },
      ],
      dance_style: { id: "s1", name: "Reggaetón", description: null },
      stats: {
        actual_price: "29.99",
        total_views: 10,
        total_sales_count: 5,
        average_rating: "4.50",
        last_updated: "2026-01-02T00:00:00Z",
      },
      video_count: 3,
    };

    expect(mapBackendChoreographyToCard(backend)).toMatchObject({
      id: "c-1",
      songName: "Despacito Remix",
      genre: "Reggaetón",
      difficulty: "Principiante",
      mainTeacher: "María García",
      guestTeacher: "Carlos Fuentes",
      price: 29.99,
      videoCount: 3,
      rating: 4.5,
      salesCount: 5,
    });
  });

  it("estimates playback minutes and completion rate", () => {
    expect(estimatePlaybackMinutes(2, 90)).toBe(3);
    expect(estimateCompletionRate(5, 2, 2)).toBe(100);
    expect(estimateCompletionRate(1, 2, 2)).toBe(25);
    expect(estimateCompletionRate(0, 2, 2)).toBe(0);
  });
});
