import type { BackendChoreography, DifficultyLevel, TeacherBrief } from "@/types/backend";
import type { Choreography } from "@/lib/mock-data";

const DIFFICULTY_LABEL: Record<DifficultyLevel, Choreography["difficulty"]> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const THUMBNAIL_COLORS = [
  "from-primary to-secondary",
  "from-secondary to-accent",
  "from-accent to-primary",
  "from-primary to-accent",
  "from-secondary to-primary",
];

function teacherName(teacher: TeacherBrief | string | undefined): string {
  if (!teacher) return "Sin profesor";
  if (typeof teacher === "string") return teacher;
  const full = `${teacher.first_name} ${teacher.last_name}`.trim();
  return full || teacher.email;
}

function guestTeacherNames(guests: BackendChoreography["guest_teachers"]): string | undefined {
  if (!guests?.length) return undefined;
  const names = guests.map((g) => teacherName(g as TeacherBrief | string)).filter(Boolean);
  return names.length ? names.join(", ") : undefined;
}

function danceStyleName(style: BackendChoreography["dance_style"]): string {
  if (!style) return "General";
  if (typeof style === "string") return style;
  return style.name;
}

export function mapDifficultyFromBackend(level: DifficultyLevel): Choreography["difficulty"] {
  return DIFFICULTY_LABEL[level] ?? "Principiante";
}

export function mapDifficultyToBackend(label: Choreography["difficulty"]): DifficultyLevel {
  if (label === "Intermedio") return "intermediate";
  if (label === "Avanzado") return "advanced";
  return "beginner";
}

export function mapBackendChoreographyToCard(
  item: BackendChoreography,
  index = 0
): Choreography {
  const price = item.stats?.actual_price ? Number(item.stats.actual_price) : 0;
  const rating = item.stats?.average_rating ? Number(item.stats.average_rating) : 0;
  const salesCount = item.stats?.total_sales_count ?? 0;
  const videoCount = item.video_count ?? item.videos?.length ?? 0;

  return {
    id: item.id,
    songName: item.title,
    genre: danceStyleName(item.dance_style),
    difficulty: mapDifficultyFromBackend(item.difficulty_level),
    mainTeacher: teacherName(item.main_teacher as TeacherBrief | string),
    guestTeacher: guestTeacherNames(item.guest_teachers),
    price: Number.isFinite(price) ? price : 0,
    description: item.description,
    videoCount,
    rating: Number.isFinite(rating) ? rating : 0,
    reviewCount: 0,
    salesCount,
    thumbnailColor: THUMBNAIL_COLORS[index % THUMBNAIL_COLORS.length],
    createdAt: item.created_at,
  };
}

export function estimatePlaybackMinutes(plays: number, durationSeconds: number): number {
  if (plays <= 0 || durationSeconds <= 0) return 0;
  return Number(((plays * durationSeconds) / 60).toFixed(1));
}

export function estimateCompletionRate(
  plays: number,
  enrollments: number,
  videoCount: number
): number {
  const denominator = enrollments * Math.max(videoCount, 1);
  if (denominator <= 0 || plays <= 0) return 0;
  return Math.min(100, Math.round((plays / denominator) * 100));
}
