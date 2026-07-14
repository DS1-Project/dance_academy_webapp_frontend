import type { Choreography } from "@/lib/mock-data";

export const LANDING_GENRE_LIMIT = 5;

export interface LandingGenreLink {
  name: string;
  count: number;
}

export interface LandingCatalogStats {
  choreographyCount: number;
  genreCount: number;
  teacherCount: number;
  averageRating: number;
}

export function buildLandingGenreLinks(
  items: Choreography[],
  limit = LANDING_GENRE_LIMIT
): LandingGenreLink[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const genre = item.genre?.trim();
    if (!genre) continue;
    counts.set(genre, (counts.get(genre) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .filter((g) => g.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"))
    .slice(0, limit);
}

export function computeLandingCatalogStats(items: Choreography[]): LandingCatalogStats {
  const teachers = new Set<string>();
  const genres = new Set<string>();
  let ratingSum = 0;
  let ratingCount = 0;

  for (const item of items) {
    if (item.mainTeacher) teachers.add(item.mainTeacher);
    if (item.guestTeacher) {
      item.guestTeacher.split(", ").forEach((name) => {
        if (name.trim()) teachers.add(name.trim());
      });
    }
    if (item.genre) genres.add(item.genre);
    if (item.rating > 0) {
      ratingSum += item.rating;
      ratingCount += 1;
    }
  }

  return {
    choreographyCount: items.length,
    genreCount: genres.size,
    teacherCount: teachers.size,
    averageRating: ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(1)) : 0,
  };
}
