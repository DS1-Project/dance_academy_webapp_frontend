import { describe, expect, it } from "vitest";
import {
  buildChoreographyPayload,
  buildVideoPayloads,
  createEmptyVideoRow,
  planVideoDiff,
  validateChoreographyDetails,
  validateVideoRows,
  videoClipToFormRow,
  type VideoFormRow,
} from "@/lib/choreographyForm";
import type { BackendVideoClip } from "@/types/backend";

function makeRow(overrides: Partial<VideoFormRow> = {}): VideoFormRow {
  return {
    rowId: overrides.rowId ?? "row-1",
    existingId: overrides.existingId,
    title: overrides.title ?? "Paso base",
    durationSeconds: overrides.durationSeconds ?? "90",
    videoUrl: overrides.videoUrl ?? "https://cdn.example.com/v1.mp4",
  };
}

describe("choreographyForm", () => {
  it("builds video payloads with sequential order starting at 1", () => {
    const rows = [makeRow({ title: "Intro" }), makeRow({ title: "Combo", durationSeconds: "120" })];
    expect(buildVideoPayloads(rows)).toEqual([
      { title: "Intro", video_url: "https://cdn.example.com/v1.mp4", duration_seconds: 90, sequence_order: 1 },
      { title: "Combo", video_url: "https://cdn.example.com/v1.mp4", duration_seconds: 120, sequence_order: 2 },
    ]);
  });

  it("requires at least one video", () => {
    expect(validateVideoRows([])).toMatch(/al menos/i);
    expect(validateVideoRows([makeRow()])).toBeNull();
  });

  it("validates each video row", () => {
    expect(validateVideoRows([makeRow({ title: "" })])).toMatch(/título/i);
    expect(validateVideoRows([makeRow({ videoUrl: "not-a-url" })])).toMatch(/URL/i);
    expect(validateVideoRows([makeRow({ durationSeconds: "0" })])).toMatch(/duración/i);
  });

  it("validates choreography detail fields", () => {
    const base = {
      title: "Mi coreo",
      description: "Desc",
      difficultyLevel: "beginner" as const,
      danceStyleId: "style-1",
      actualPrice: "19.99",
      thumbnailUrl: "",
      guestTeacherIds: [],
    };
    expect(validateChoreographyDetails(base)).toBeNull();
    expect(validateChoreographyDetails({ ...base, title: "" })).toMatch(/título/i);
    expect(validateChoreographyDetails({ ...base, danceStyleId: "" })).toMatch(/estilo/i);
    expect(validateChoreographyDetails({ ...base, actualPrice: "0" })).toMatch(/precio/i);
  });

  it("builds the choreography payload trimming and dropping empty optional fields", () => {
    const payload = buildChoreographyPayload({
      title: "  Mi coreo  ",
      description: " Desc ",
      difficultyLevel: "intermediate",
      danceStyleId: "style-1",
      actualPrice: "29.5",
      thumbnailUrl: "",
      guestTeacherIds: [],
    });
    expect(payload).toEqual({
      title: "Mi coreo",
      description: "Desc",
      difficulty_level: "intermediate",
      dance_style: "style-1",
      thumbnail_url: "",
      actual_price: 29.5,
      guest_teachers: undefined,
    });
  });

  it("converts a backend video clip into a form row", () => {
    const clip: BackendVideoClip = {
      id: "v-1",
      title: "Paso 1",
      video_url: "https://cdn.example.com/v1.mp4",
      sequence_order: 1,
      duration_seconds: 60,
    };
    expect(videoClipToFormRow(clip)).toEqual({
      rowId: "v-1",
      existingId: "v-1",
      title: "Paso 1",
      durationSeconds: "60",
      videoUrl: "https://cdn.example.com/v1.mp4",
    });
  });

  it("creates an empty video row with a given id", () => {
    expect(createEmptyVideoRow("new-1")).toEqual({
      rowId: "new-1",
      title: "",
      durationSeconds: "",
      videoUrl: "",
    });
  });

  describe("planVideoDiff", () => {
    const original: BackendVideoClip[] = [
      { id: "v-1", title: "Paso 1", video_url: "https://cdn.example.com/v1.mp4", sequence_order: 1, duration_seconds: 60 },
      { id: "v-2", title: "Paso 2", video_url: "https://cdn.example.com/v2.mp4", sequence_order: 2, duration_seconds: 90 },
    ];

    it("detects new rows to create", () => {
      const current = [videoClipToFormRow(original[0]), videoClipToFormRow(original[1]), makeRow({ rowId: "new-1" })];
      const plan = planVideoDiff(original, current);
      expect(plan.toCreate).toHaveLength(1);
      expect(plan.toDelete).toEqual([]);
      expect(plan.toUpdate).toEqual([]);
    });

    it("detects removed rows to delete", () => {
      const current = [videoClipToFormRow(original[0])];
      const plan = planVideoDiff(original, current);
      expect(plan.toDelete).toEqual(["v-2"]);
      expect(plan.toCreate).toEqual([]);
    });

    it("detects changed rows to update", () => {
      const changedRow = { ...videoClipToFormRow(original[0]), title: "Paso 1 editado" };
      const current = [changedRow, videoClipToFormRow(original[1])];
      const plan = planVideoDiff(original, current);
      expect(plan.toUpdate).toEqual([
        {
          videoId: "v-1",
          payload: {
            title: "Paso 1 editado",
            video_url: "https://cdn.example.com/v1.mp4",
            duration_seconds: 60,
            sequence_order: 1,
          },
        },
      ]);
    });

    it("detects order changes when rows are reordered", () => {
      const current = [videoClipToFormRow(original[1]), videoClipToFormRow(original[0])];
      const plan = planVideoDiff(original, current);
      expect(plan.toUpdate.map((u) => u.videoId).sort()).toEqual(["v-1", "v-2"]);
    });
  });
});
