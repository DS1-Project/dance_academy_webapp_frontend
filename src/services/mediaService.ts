import { api } from "@/lib/api";
import type { MediaUploadResponse } from "@/types/backend";

export async function uploadMediaFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  // Do not set Content-Type manually: the browser must add the multipart boundary.
  // The shared axios instance defaults to application/json, so clear it here.
  const { data } = await api.post<MediaUploadResponse>("/api/media/upload/", formData, {
    timeout: 120_000,
    transformRequest: [
      (payload, headers) => {
        if (headers && typeof (headers as { set?: (k: string, v: unknown) => void }).set === "function") {
          (headers as { set: (k: string, v: unknown) => void }).set("Content-Type", undefined);
        } else if (headers) {
          delete (headers as Record<string, unknown>)["Content-Type"];
        }
        return payload;
      },
    ],
  });

  return data.url;
}
