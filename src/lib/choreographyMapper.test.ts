import { describe, expect, it } from "vitest";
import {
  buildChoreographyStatRows,
  estimateCompletionRate,
  estimatePlaybackMinutes,
  mapBackendChoreographyToCard,
  mapDifficultyFromBackend,
  mapDifficultyToBackend,
  rankByLeastSold,
  rankByMostSold,
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

  describe("buildChoreographyStatRows / ranking", () => {
    const makeItem = (
      id: string,
      sales: number,
      views: number,
      videos?: BackendChoreography["videos"]
    ): BackendChoreography => ({
      id,
      title: `Coreo ${id}`,
      description: "",
      difficulty_level: "beginner",
      thumbnail_url: "",
      is_approved: true,
      created_at: "2026-01-01T00:00:00Z",
      main_teacher: { id: "t1", email: "t@test.com", first_name: "Ana", last_name: "Ruiz" },
      dance_style: { id: "s1", name: "Salsa", description: null },
      stats: {
        actual_price: "10.00",
        total_views: views,
        total_sales_count: sales,
        average_rating: "4.00",
        last_updated: "2026-01-02T00:00:00Z",
      },
      video_count: videos?.length ?? 1,
      videos,
    });

    it("builds stat rows with estimated playback and completion using video durations", () => {
      const items = [
        makeItem("a", 10, 20, [
          { id: "v1", title: "V1", sequence_order: 1, duration_seconds: 60 },
          { id: "v2", title: "V2", sequence_order: 2, duration_seconds: 120 },
        ]),
      ];
      const rows = buildChoreographyStatRows(items);
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        id: "a",
        totalViews: 20,
        totalSales: 10,
        averageRating: 4,
        estimatedPlaybackMinutes: 30, // 20 plays * 90s avg / 60
      });
      expect(rows[0].estimatedCompletionRate).toBe(100);
    });

    it("falls back to zero playback minutes when there are no videos loaded", () => {
      const rows = buildChoreographyStatRows([makeItem("b", 5, 10, undefined)]);
      expect(rows[0].estimatedPlaybackMinutes).toBe(0);
    });

    it("ranks by most and least sold", () => {
      const rows = buildChoreographyStatRows([
        makeItem("low", 2, 5),
        makeItem("high", 50, 5),
        makeItem("mid", 20, 5),
      ]);
      expect(rankByMostSold(rows, 2).map((r) => r.id)).toEqual(["high", "mid"]);
      expect(rankByLeastSold(rows, 2).map((r) => r.id)).toEqual(["low", "mid"]);
    });
  });
});
