/** Medios verificados: tutoriales YouTube del género + fotos Pexels de baile. */

export const GENRE_VIDEO_URLS: Record<string, string[]> = {
  Salsa: [
    "https://www.youtube.com/watch?v=3YdanXsm5Vo", // Cuban salsa workshop — Sadler's Wells
    "https://www.youtube.com/watch?v=hX7_1DUWJJQ", // Basic salsa step and rhythm
    "https://www.youtube.com/watch?v=6R0cLhESYaQ", // Basic salsa step and rhythm 2
  ],
  Bachata: [
    "https://www.youtube.com/watch?v=xhrdh-uFkog", // Bachata beginner basics — Bachata Dance Academy
    "https://www.youtube.com/watch?v=uYogZ8wGrv0", // 20 bachata basic moves — Marius & Elena
    "https://www.youtube.com/watch?v=QmWRe4GRH8k", // Bachata basic step class
  ],
  Merengue: [
    "https://www.youtube.com/watch?v=daaHi0jtHlw", // Merengue level 1 — Kennedy Center
    "https://www.youtube.com/watch?v=sdh3b5hZOC0", // How to dance merengue for beginners
    "https://www.youtube.com/watch?v=amuqoK53QVU", // Merengue basic steps and turns
  ],
  "Hip-Hop": [
    "https://www.youtube.com/watch?v=ujREEgxEP7g", // 3 simple hip hop moves — MihranTV
    "https://www.youtube.com/watch?v=Z3Z6Qii-g2Y", // Hip hop for beginners — 5 basic moves
    "https://www.youtube.com/watch?v=lYpRasK4c9k", // Running Man — Howcast hip-hop
  ],
  Reggaetón: [
    "https://www.youtube.com/watch?v=JTn1h8pZSMU", // Cuban reggaeton & perreo class
    "https://www.youtube.com/watch?v=G3wEHSkBksI", // Reggaeton choreography "Problema"
    "https://www.youtube.com/watch?v=JTn1h8pZSMU",
  ],
};

/** Fotos Pexels comprobadas (parejas / estudio / urbano), no paisajes. */
export const GENRE_THUMBNAIL_URLS: Record<string, string> = {
  Salsa:
    "https://images.pexels.com/photos/37943801/pexels-photo-37943801.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&fit=crop",
  Bachata:
    "https://images.pexels.com/photos/6926433/pexels-photo-6926433.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&fit=crop",
  Merengue:
    "https://images.pexels.com/photos/2188012/pexels-photo-2188012.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&fit=crop",
  "Hip-Hop":
    "https://images.pexels.com/photos/6224442/pexels-photo-6224442.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&fit=crop",
  Reggaetón:
    "https://images.pexels.com/photos/1701202/pexels-photo-1701202.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&fit=crop",
};

export function videosForGenre(genre?: string | null): string[] {
  if (!genre) return GENRE_VIDEO_URLS.Salsa;
  return GENRE_VIDEO_URLS[genre] ?? GENRE_VIDEO_URLS.Salsa;
}

export function thumbnailForGenre(genre?: string | null): string {
  if (!genre) return GENRE_THUMBNAIL_URLS.Salsa;
  return GENRE_THUMBNAIL_URLS[genre] ?? GENRE_THUMBNAIL_URLS.Salsa;
}
