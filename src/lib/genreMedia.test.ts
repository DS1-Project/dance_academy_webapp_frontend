import { describe, expect, it } from "vitest";
import { GENRE_THUMBNAIL_URLS, GENRE_VIDEO_URLS, thumbnailForGenre, videosForGenre } from "@/lib/genreMedia";
import { pickNextSampleVideoUrl } from "@/lib/sampleVideoUrls";

describe("genreMedia", () => {
  it("maps each catalog genre to themed videos and thumbnails", () => {
    for (const genre of Object.keys(GENRE_VIDEO_URLS)) {
      expect(videosForGenre(genre).length).toBeGreaterThan(0);
      expect(thumbnailForGenre(genre)).toContain("pexels.com");
      expect(GENRE_THUMBNAIL_URLS[genre]).toBeTruthy();
    }
  });

  it("picks sample urls for the selected genre", () => {
    const salsa = pickNextSampleVideoUrl(0, "Salsa");
    expect(salsa.url).toBe(GENRE_VIDEO_URLS.Salsa[0]);
    expect(salsa.label).toMatch(/Salsa/i);

    const bachata = pickNextSampleVideoUrl(1, "Bachata");
    expect(bachata.url).toBe(GENRE_VIDEO_URLS.Bachata[1]);
  });
});
