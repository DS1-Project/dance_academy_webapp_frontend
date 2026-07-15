import type { BackendChoreography, TeacherBrief } from "@/types/backend";

export interface CatalogTeacherProfile {
  id: string;
  name: string;
  specialty: string;
  bio: string;
  experience: string;
  genres: string[];
  rating: number;
  students: number;
  choreographyCount: number;
  gradientFrom: string;
  gradientTo: string;
}

const GRADIENTS: Array<[string, string]> = [
  ["from-secondary", "to-rose-400"],
  ["from-primary", "to-amber-400"],
  ["from-violet-500", "to-secondary"],
  ["from-fuchsia-600", "to-primary"],
  ["from-amber-500", "to-primary"],
  ["from-emerald-500", "to-teal-400"],
  ["from-sky-500", "to-indigo-500"],
];

function teacherKey(teacher: TeacherBrief | string): string {
  if (typeof teacher === "string") return teacher;
  return teacher.id || teacher.email;
}

function teacherDisplayName(teacher: TeacherBrief | string): string {
  if (typeof teacher === "string") return teacher;
  const full = `${teacher.first_name} ${teacher.last_name}`.trim();
  return full || teacher.email;
}

function danceStyleName(style: BackendChoreography["dance_style"]): string | null {
  if (!style) return null;
  if (typeof style === "string") return style;
  return style.name;
}

function pickGradient(key: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash + key.charCodeAt(i) * (i + 1)) % GRADIENTS.length;
  }
  return GRADIENTS[hash] ?? GRADIENTS[0];
}

interface TeacherAccumulator {
  id: string;
  name: string;
  genres: Set<string>;
  choreographyCount: number;
  students: number;
  ratingSum: number;
  ratingWeight: number;
}

function addTeacherToMap(
  map: Map<string, TeacherAccumulator>,
  teacher: TeacherBrief | string,
  choreo: BackendChoreography
) {
  const id = teacherKey(teacher);
  const name = teacherDisplayName(teacher);
  const genre = danceStyleName(choreo.dance_style);
  const sales = choreo.stats?.total_sales_count ?? 0;
  const rating = choreo.stats?.average_rating ? Number(choreo.stats.average_rating) : 0;

  const existing = map.get(id);
  if (existing) {
    existing.choreographyCount += 1;
    existing.students += sales;
    if (genre) existing.genres.add(genre);
    if (Number.isFinite(rating) && rating > 0) {
      existing.ratingSum += rating;
      existing.ratingWeight += 1;
    }
    return;
  }

  map.set(id, {
    id,
    name,
    genres: new Set(genre ? [genre] : []),
    choreographyCount: 1,
    students: sales,
    ratingSum: Number.isFinite(rating) && rating > 0 ? rating : 0,
    ratingWeight: Number.isFinite(rating) && rating > 0 ? 1 : 0,
  });
}

export function deriveTeachersFromChoreographies(
  items: BackendChoreography[]
): CatalogTeacherProfile[] {
  const map = new Map<string, TeacherAccumulator>();

  for (const choreo of items) {
    if (choreo.main_teacher) {
      addTeacherToMap(map, choreo.main_teacher, choreo);
    }
    for (const guest of choreo.guest_teachers ?? []) {
      addTeacherToMap(map, guest as TeacherBrief | string, choreo);
    }
  }

  return [...map.values()]
    .map((entry) => {
      const genres = [...entry.genres].sort((a, b) => a.localeCompare(b, "es"));
      const specialty =
        genres.length >= 2 ? `${genres[0]} & ${genres[1]}` : genres[0] ?? "Coreografías";
      const rating =
        entry.ratingWeight > 0
          ? Number((entry.ratingSum / entry.ratingWeight).toFixed(1))
          : 0;
      const [gradientFrom, gradientTo] = pickGradient(entry.id);

      return {
        id: entry.id,
        name: entry.name,
        specialty,
        bio: `Profesor en D'Academy con ${entry.choreographyCount} coreografía${entry.choreographyCount === 1 ? "" : "s"} publicada${entry.choreographyCount === 1 ? "" : "s"}.`,
        experience: "—",
        genres,
        rating,
        students: entry.students,
        choreographyCount: entry.choreographyCount,
        gradientFrom,
        gradientTo,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}
