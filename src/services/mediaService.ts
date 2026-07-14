import { api } from "@/lib/api";
import type { MediaUploadResponse } from "@/types/backend";

export async function uploadMediaFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<MediaUploadResponse>("/api/media/upload/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.url;
}
