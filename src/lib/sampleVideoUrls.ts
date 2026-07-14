// URLs de ejemplo para agilizar la demostración del formulario de coreografías.
// No es el flujo principal: solo ayudan a precargar un video cuando el profesor
// no tiene un archivo o URL propia a la mano todavía.
export interface SampleVideoUrl {
  label: string;
  url: string;
}

export const SAMPLE_VIDEO_URLS: SampleVideoUrl[] = [
  { label: "Ejemplo 1 — Coreografía básica", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { label: "Ejemplo 2 — Rutina intermedia", url: "https://www.youtube.com/watch?v=3JZ_D3ELwOQ" },
  { label: "Ejemplo 3 — Combo avanzado", url: "https://www.youtube.com/watch?v=eY52Zsg-KVI" },
];

export function pickNextSampleVideoUrl(usedCount: number): SampleVideoUrl {
  return SAMPLE_VIDEO_URLS[usedCount % SAMPLE_VIDEO_URLS.length];
}
