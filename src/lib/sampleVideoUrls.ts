import { videosForGenre } from "@/lib/genreMedia";

export interface SampleVideoUrl {
  label: string;
  url: string;
}

export function pickNextSampleVideoUrl(usedCount: number, genre?: string | null): SampleVideoUrl {
  const urls = videosForGenre(genre);
  const url = urls[usedCount % urls.length];
  const genreLabel = genre?.trim() || "baile";
  return {
    label: `Ejemplo ${usedCount + 1} — ${genreLabel}`,
    url,
  };
}
