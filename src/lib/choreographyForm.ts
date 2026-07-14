import type {
  BackendVideoClip,
  CreateChoreographyPayload,
  CreateVideoPayload,
  DifficultyLevel,
} from "@/types/backend";
import {
  firstError,
  required,
  validateHttpUrl,
  validateMinVideos,
  validatePositiveNumber,
} from "@/lib/formValidation";

export interface VideoFormRow {
  /** Local row id used for React keys and diffing; independent from the backend id. */
  rowId: string;
  /** Present only when the row maps to a video that already exists on the backend. */
  existingId?: string;
  title: string;
  durationSeconds: string;
  videoUrl: string;
}

export function createEmptyVideoRow(rowId: string): VideoFormRow {
  return { rowId, title: "", durationSeconds: "", videoUrl: "" };
}

export function videoClipToFormRow(video: BackendVideoClip): VideoFormRow {
  return {
    rowId: video.id,
    existingId: video.id,
    title: video.title,
    durationSeconds: String(video.duration_seconds ?? ""),
    videoUrl: video.video_url ?? "",
  };
}

export function buildVideoPayloads(rows: VideoFormRow[]): CreateVideoPayload[] {
  return rows.map((row, index) => ({
    title: row.title.trim(),
    video_url: row.videoUrl.trim(),
    duration_seconds: Number(row.durationSeconds) || 0,
    sequence_order: index + 1,
  }));
}

export function validateVideoRows(rows: VideoFormRow[]): string | null {
  const minError = validateMinVideos(rows.length);
  if (minError) return minError;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const position = i + 1;
    const rowError = firstError(
      required(row.title, `El título del video #${position}`),
      validateHttpUrl(row.videoUrl, `La URL del video #${position}`),
      validatePositiveNumber(Number(row.durationSeconds), `La duración del video #${position}`)
    );
    if (rowError) return rowError;
  }

  return null;
}

export interface ChoreographyFormValues {
  title: string;
  description: string;
  difficultyLevel: DifficultyLevel;
  danceStyleId: string;
  actualPrice: string;
  thumbnailUrl: string;
  guestTeacherIds: string[];
}

export function validateChoreographyDetails(values: ChoreographyFormValues): string | null {
  return firstError(
    required(values.title, "El título"),
    required(values.description, "La descripción"),
    required(values.danceStyleId, "El estilo de baile"),
    validatePositiveNumber(Number(values.actualPrice), "El precio")
  );
}

export function buildChoreographyPayload(values: ChoreographyFormValues): CreateChoreographyPayload {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    difficulty_level: values.difficultyLevel,
    dance_style: values.danceStyleId,
    thumbnail_url: values.thumbnailUrl.trim(),
    actual_price: values.actualPrice.trim() ? Number(values.actualPrice) : undefined,
    guest_teachers: values.guestTeacherIds.length ? values.guestTeacherIds : undefined,
  };
}

export interface VideoDiffPlan {
  toCreate: VideoFormRow[];
  toUpdate: Array<{ videoId: string; payload: Partial<CreateVideoPayload> }>;
  toDelete: string[];
}

/**
 * Compares the original videos loaded from the backend against the rows currently
 * edited in the form, producing the minimal set of create/update/delete operations.
 */
export function planVideoDiff(original: BackendVideoClip[], current: VideoFormRow[]): VideoDiffPlan {
  const currentExistingIds = new Set(
    current.filter((row) => row.existingId).map((row) => row.existingId as string)
  );
  const toDelete = original.filter((video) => !currentExistingIds.has(video.id)).map((video) => video.id);

  const toCreate: VideoFormRow[] = [];
  const toUpdate: Array<{ videoId: string; payload: Partial<CreateVideoPayload> }> = [];

  current.forEach((row, index) => {
    if (!row.existingId) {
      toCreate.push(row);
      return;
    }

    const payload: Partial<CreateVideoPayload> = {
      title: row.title.trim(),
      video_url: row.videoUrl.trim(),
      duration_seconds: Number(row.durationSeconds) || 0,
      sequence_order: index + 1,
    };

    const originalVideo = original.find((video) => video.id === row.existingId);
    const changed =
      !originalVideo ||
      originalVideo.title !== payload.title ||
      (originalVideo.video_url ?? "") !== payload.video_url ||
      originalVideo.duration_seconds !== payload.duration_seconds ||
      originalVideo.sequence_order !== payload.sequence_order;

    if (changed) {
      toUpdate.push({ videoId: row.existingId, payload });
    }
  });

  return { toCreate, toUpdate, toDelete };
}
