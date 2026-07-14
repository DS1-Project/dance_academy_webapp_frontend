import { describe, expect, it } from "vitest";
import { buildLandingGenreLinks, computeLandingCatalogStats } from "@/lib/landingStats";
import type { Choreography } from "@/lib/mock-data";

function stub(partial: Partial<Choreography> & Pick<Choreography, "id" | "songName" | "genre" | "mainTeacher">): Choreography {
  return {
    difficulty: "Principiante",
    price: 10,
    description: "",
    videoCount: 1,
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    thumbnailColor: "from-primary to-secondary",
    ...partial,
  };
}

describe("landingStats", () => {
  const items = [
    stub({ id: "1", songName: "A", genre: "Salsa", mainTeacher: "María", rating: 5, guestTeacher: "Carlos" }),
    stub({ id: "2", songName: "B", genre: "Salsa", mainTeacher: "María", rating: 4 }),
    stub({ id: "3", songName: "C", genre: "Bachata", mainTeacher: "Ana", rating: 4.5 }),
    stub({ id: "4", songName: "D", genre: "Hip-Hop", mainTeacher: "David", rating: 0 }),
    stub({ id: "5", songName: "E", genre: "Merengue", mainTeacher: "Lucía", rating: 3 }),
    stub({ id: "6", songName: "F", genre: "Reggaetón", mainTeacher: "Carlos", rating: 5 }),
    stub({ id: "7", songName: "G", genre: "Cumbia", mainTeacher: "Extra", rating: 2 }),
  ];

  it("returns at most 5 genres that actually have choreographies, ordered by count", () => {
    const links = buildLandingGenreLinks(items, 5);
    expect(links).toHaveLength(5);
    expect(links[0]).toEqual({ name: "Salsa", count: 2 });
    // Con empates, el 6º alfabético queda fuera (Reggaetón)
    expect(links.map((g) => g.name)).not.toContain("Reggaetón");
    expect(links.every((g) => g.count > 0)).toBe(true);
  });

  it("computes live landing stats from catalog items", () => {
    expect(computeLandingCatalogStats(items)).toEqual({
      choreographyCount: 7,
      genreCount: 6,
      teacherCount: 6,
      averageRating: 3.9,
    });
  });
});
