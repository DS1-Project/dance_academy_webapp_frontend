import { api, getApiErrorMessage } from "@/lib/api";
import type {
  BackendChoreography,
  BackendReview,
  BackendVideoClip,
  CreateChoreographyPayload,
  CreateVideoPayload,
  DanceStyle,
  PlaybackHistoryItem,
} from "@/types/backend";

export async function listChoreographies(params?: {
  search?: string;
  difficulty_level?: string;
  dance_style?: string;
  is_approved?: boolean;
}): Promise<BackendChoreography[]> {
  const { data } = await api.get<BackendChoreography[]>("/api/choreographies/", { params });
  return data;
}

export async function getChoreographyDetail(id: string): Promise<BackendChoreography> {
  const { data } = await api.get<BackendChoreography>(`/api/choreographies/${id}/`);
  return data;
}

export async function getMyChoreographies(): Promise<BackendChoreography[]> {
  const { data } = await api.get<BackendChoreography[]>("/api/choreographies/mine/");
  return data;
}

export async function getPurchasedChoreographies(): Promise<BackendChoreography[]> {
  const { data } = await api.get<BackendChoreography[]>("/api/choreographies/purchased/");
  return data;
}

export async function getPlaybackHistory(): Promise<PlaybackHistoryItem[]> {
  const { data } = await api.get<PlaybackHistoryItem[]>("/api/choreographies/playback-history/");
  return data;
}

export async function createChoreography(
  payload: CreateChoreographyPayload
): Promise<BackendChoreography> {
  const { data } = await api.post<BackendChoreography>("/api/choreographies/", payload);
  return data;
}

export async function updateChoreography(
  id: string,
  payload: Partial<CreateChoreographyPayload>
): Promise<BackendChoreography> {
  const { data } = await api.patch<BackendChoreography>(`/api/choreographies/${id}/`, payload);
  return data;
}

export async function deleteChoreography(id: string): Promise<void> {
  await api.delete(`/api/choreographies/${id}/`);
}

export async function approveChoreography(id: string): Promise<BackendChoreography> {
  const { data } = await api.post<BackendChoreography>(`/api/choreographies/${id}/approve/`);
  return data;
}

export async function updateChoreographyPrice(
  id: string,
  actual_price: number | string
): Promise<BackendChoreography> {
  const { data } = await api.patch<BackendChoreography>(`/api/choreographies/${id}/price/`, {
    actual_price,
  });
  return data;
}

export async function listChoreographyVideos(id: string): Promise<BackendVideoClip[]> {
  const { data } = await api.get<BackendVideoClip[]>(`/api/choreographies/${id}/videos/`);
  return data;
}

export async function addChoreographyVideo(
  id: string,
  payload: CreateVideoPayload
): Promise<BackendVideoClip> {
  const { data } = await api.post<BackendVideoClip>(`/api/choreographies/${id}/videos/`, payload);
  return data;
}

export async function listDanceStyles(): Promise<DanceStyle[]> {
  const { data } = await api.get<DanceStyle[]>("/api/dance-styles/");
  return data;
}

export async function getChoreographyReviews(id: string): Promise<BackendReview[]> {
  try {
    const { data } = await api.get<BackendReview[]>(`/api/choreographies/${id}/reviews/`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudieron cargar las reviews"));
  }
}

export async function createChoreographyReview(
  id: string,
  payload: { rating: number; comment?: string }
): Promise<BackendReview> {
  try {
    const { data } = await api.post<BackendReview>(`/api/choreographies/${id}/reviews/`, payload);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo guardar la review"));
  }
}
