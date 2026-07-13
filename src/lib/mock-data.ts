import type { Review } from "@/types/reviews";

export interface Choreography {
  id: string;
  songName: string;
  genre: string;
  difficulty: "Principiante" | "Intermedio" | "Avanzado";
  mainTeacher: string;
  guestTeacher?: string;
  price: number;
  description: string;
  videoCount: number;
  rating: number;
  reviewCount: number;
  salesCount: number;
  thumbnailColor: string;
  reviews?: Review[];
}

export const genres = ["Salsa", "Merengue", "Bachata", "Pop", "Hip-Hop", "Reggaetón", "Cumbia", "Contemporáneo"];
export const difficulties = ["Principiante", "Intermedio", "Avanzado"] as const;
export const teachers = ["María García", "Carlos Fuentes", "Ana Rodríguez", "David Chen", "Lucía Morales"];

export const choreographies: Choreography[] = [
  {
    id: "1",
    songName: "Despacito Remix",
    genre: "Reggaetón",
    difficulty: "Principiante",
    mainTeacher: "María García",
    guestTeacher: "Carlos Fuentes",
    price: 29.99,
    description: "Aprende los pasos más icónicos de este hit mundial. Perfecto para comenzar tu viaje en el baile.",
    videoCount: 4,
    rating: 4.8,
    reviewCount: 127,
    salesCount: 892,
    thumbnailColor: "from-primary to-secondary",
    reviews: [
      {
        id: "r-1",
        userName: "Mariana",
        comment: "Muy claro y divertido.",
        rating: 5,
        createdAt: "2026-06-20T10:00:00.000Z",
      },
      {
        id: "r-2",
        userName: "Luis",
        comment: "Ideal para comenzar.",
        rating: 4,
        createdAt: "2026-06-22T14:30:00.000Z",
      },
    ],
  },
  {
    id: "2",
    songName: "Vivir Mi Vida",
    genre: "Salsa",
    difficulty: "Intermedio",
    mainTeacher: "Ana Rodríguez",
    price: 34.99,
    description: "Coreografía completa con giros avanzados y trabajo de pies que te hará brillar en la pista.",
    videoCount: 3,
    rating: 4.9,
    reviewCount: 89,
    salesCount: 654,
    thumbnailColor: "from-secondary to-accent",
    reviews: [
      {
        id: "r-3",
        userName: "Sofía",
        comment: "Los giros quedaron muy bien explicados.",
        rating: 5,
        createdAt: "2026-06-16T10:00:00.000Z",
      },
    ],
  },
  {
    id: "3",
    songName: "Suavemente",
    genre: "Merengue",
    difficulty: "Principiante",
    mainTeacher: "Carlos Fuentes",
    price: 24.99,
    description: "El clásico merengue que todos necesitan dominar. Ritmo puro y diversión garantizada.",
    videoCount: 3,
    rating: 4.7,
    reviewCount: 203,
    salesCount: 1247,
    thumbnailColor: "from-primary to-orange-400",
    reviews: [
      {
        id: "r-4",
        userName: "Camila",
        comment: "Muy buena introducción al ritmo.",
        rating: 4,
        createdAt: "2026-06-12T09:45:00.000Z",
      },
    ],
  },
  {
    id: "4",
    songName: "Uptown Funk",
    genre: "Hip-Hop",
    difficulty: "Intermedio",
    mainTeacher: "David Chen",
    guestTeacher: "Lucía Morales",
    price: 39.99,
    description: "Groove, actitud y técnica. Una coreografía que combina funk clásico con movimientos contemporáneos.",
    videoCount: 4,
    rating: 4.6,
    reviewCount: 156,
    salesCount: 567,
    thumbnailColor: "from-fuchsia-600 to-primary",
  },
  {
    id: "5",
    songName: "Obsesión",
    genre: "Bachata",
    difficulty: "Avanzado",
    mainTeacher: "María García",
    price: 44.99,
    description: "Bachata sensual con movimientos que requieren control corporal y conexión. Para bailarines experimentados.",
    videoCount: 4,
    rating: 4.9,
    reviewCount: 78,
    salesCount: 423,
    thumbnailColor: "from-rose-500 to-secondary",
  },
  {
    id: "6",
    songName: "La Bicicleta",
    genre: "Cumbia",
    difficulty: "Principiante",
    mainTeacher: "Lucía Morales",
    guestTeacher: "Ana Rodríguez",
    price: 27.99,
    description: "Ritmos colombianos que te pondrán a bailar desde el primer momento. ¡Pura alegría!",
    videoCount: 3,
    rating: 4.5,
    reviewCount: 94,
    salesCount: 378,
    thumbnailColor: "from-amber-500 to-primary",
  },
  {
    id: "7",
    songName: "Blinding Lights",
    genre: "Pop",
    difficulty: "Intermedio",
    mainTeacher: "David Chen",
    price: 34.99,
    description: "Choreography retro-futurista que mezcla pop dance con movimientos precisos de sincronización.",
    videoCount: 3,
    rating: 4.7,
    reviewCount: 112,
    salesCount: 789,
    thumbnailColor: "from-primary to-rose-400",
  },
  {
    id: "8",
    songName: "Gravity",
    genre: "Contemporáneo",
    difficulty: "Avanzado",
    mainTeacher: "Ana Rodríguez",
    price: 49.99,
    description: "Pieza de danza contemporánea que explora la conexión entre gravedad y movimiento fluido.",
    videoCount: 4,
    rating: 5.0,
    reviewCount: 45,
    salesCount: 234,
    thumbnailColor: "from-secondary to-violet-500",
  },
];
