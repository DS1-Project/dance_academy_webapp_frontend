import { describe, expect, it } from "vitest";
import { deriveTeachersFromChoreographies } from "@/lib/teacherDirectory";
import type { BackendChoreography } from "@/types/backend";

const baseChoreo = (
  overrides: Partial<BackendChoreography> & Pick<BackendChoreography, "id" | "title">
): BackendChoreography => ({
  description: "Clase",
  difficulty_level: "beginner",
  thumbnail_url: "",
  is_approved: true,
  created_at: "2026-01-01T00:00:00Z",
  main_teacher: {
    id: "t1",
    email: "maria@test.com",
    first_name: "María",
    last_name: "García",
  },
  dance_style: { id: "s1", name: "Bachata", description: null },
  stats: {
    actual_price: "29.99",
    total_views: 10,
    total_sales_count: 100,
    average_rating: "4.8",
    last_updated: "2026-01-02T00:00:00Z",
  },
  ...overrides,
});

describe("deriveTeachersFromChoreographies", () => {
  it("deduplicates teachers and aggregates genres, sales and ratings", () => {
    const items: BackendChoreography[] = [
      baseChoreo({ id: "c1", title: "One" }),
      baseChoreo({
        id: "c2",
        title: "Two",
        dance_style: { id: "s2", name: "Reggaetón", description: null },
        stats: {
          actual_price: "19.99",
          total_views: 5,
          total_sales_count: 50,
          average_rating: "4.6",
          last_updated: "2026-01-03T00:00:00Z",
        },
      }),
      baseChoreo({
        id: "c3",
        title: "Three",
        main_teacher: {
          id: "t2",
          email: "carlos@test.com",
          first_name: "Carlos",
          last_name: "Fuentes",
        },
        guest_teachers: [
          {
            id: "t1",
            email: "maria@test.com",
            first_name: "María",
            last_name: "García",
          },
        ],
        dance_style: { id: "s3", name: "Salsa", description: null },
        stats: {
          actual_price: "24.99",
          total_views: 8,
          total_sales_count: 25,
          average_rating: "5.0",
          last_updated: "2026-01-04T00:00:00Z",
        },
      }),
    ];

    const teachers = deriveTeachersFromChoreographies(items);

    expect(teachers).toHaveLength(2);

    const maria = teachers.find((t) => t.name === "María García");
    expect(maria).toMatchObject({
      choreographyCount: 3,
      students: 175,
      genres: ["Bachata", "Reggaetón", "Salsa"],
    });
    expect(maria?.rating).toBeGreaterThan(4.7);

    const carlos = teachers.find((t) => t.name === "Carlos Fuentes");
    expect(carlos).toMatchObject({
      choreographyCount: 1,
      students: 25,
      genres: ["Salsa"],
      rating: 5,
    });
  });

  it("returns an empty list when there are no teachers", () => {
    expect(
      deriveTeachersFromChoreographies([
        baseChoreo({
          id: "c-empty",
          title: "Sin profesor",
          main_teacher: "",
        }),
      ])
    ).toEqual([]);
  });
});
