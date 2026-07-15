import { api } from "@/lib/api";
import type { BackendVideoClip, CreateVideoPayload } from "@/types/backend";

export async function updateVideo(
  videoId: string,
  payload: Partial<CreateVideoPayload>
): Promise<BackendVideoClip> {
  const { data } = await api.patch<BackendVideoClip>(`/api/videos/${videoId}/`, payload);
  return data;
}

export async function deleteVideo(videoId: string): Promise<void> {
  await api.delete(`/api/videos/${videoId}/`);
}

export async function playVideo(videoId: string): Promise<void> {
  await api.post(`/api/videos/${videoId}/play/`);
}
