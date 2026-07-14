import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(),
  },
}));

import { api } from "@/lib/api";
import { uploadMediaFile } from "@/services/mediaService";

describe("mediaService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uploads a file and returns the public url without forcing Content-Type", async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { url: "http://127.0.0.1:8000/media/abc_clip.mp4" },
    } as never);

    const file = new File(["bytes"], "clip.mp4", { type: "video/mp4" });
    const url = await uploadMediaFile(file);

    expect(url).toBe("http://127.0.0.1:8000/media/abc_clip.mp4");
    expect(api.post).toHaveBeenCalledWith(
      "/api/media/upload/",
      expect.any(FormData),
      expect.objectContaining({
        timeout: 120_000,
        transformRequest: expect.any(Array),
      })
    );
  });
});
