import { asc, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db/index.js";
import {
  templateExercises,
  templateSets,
  templates,
} from "../db/schema.js";
import type { AppEnv } from "../types.js";

const uuidParam = z.string().uuid();

const templateSetSchema = z.object({
  weight: z.number().min(0).default(0),
  reps: z.number().int().min(0).default(0),
});

const templateExerciseSchema = z.object({
  exerciseId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(200),
  bodyPart: z.string().trim().max(100).optional(),
  restSeconds: z.number().int().min(0).default(0),
  sets: z.array(templateSetSchema).default([]),
});

const createTemplateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  exercises: z.array(templateExerciseSchema).default([]),
});

type TemplateExerciseRow = typeof templateExercises.$inferSelect;
type TemplateSetRow = typeof templateSets.$inferSelect;
type TemplateRow = typeof templates.$inferSelect;

function serializeTemplate(
  template: TemplateRow,
  exercises: (TemplateExerciseRow & { sets: TemplateSetRow[] })[]
) {
  const ordered = [...exercises].sort((a, b) => a.position - b.position);
  return {
    id: template.id,
    name: template.name,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
    exercises: ordered.map((exercise) => ({
      id: exercise.id,
      exerciseId: exercise.exerciseId,
      name: exercise.name,
      bodyPart: exercise.bodyPart,
      restSeconds: exercise.restSeconds,
      sets: [...exercise.sets]
        .sort((a, b) => a.position - b.position)
        .map((set) => ({
          id: set.id,
          weight: set.weight,
          reps: set.reps,
        })),
    })),
  };
}

const templatesRoutes = new Hono<AppEnv>()
  .get("/", async (c) => {
    const authUser = c.get("user");

    const rows = await db.query.templates.findMany({
      where: eq(templates.userId, authUser.id),
      orderBy: [desc(templates.updatedAt)],
      with: {
        exercises: {
          orderBy: [asc(templateExercises.position)],
          with: {
            sets: {
              orderBy: [asc(templateSets.position)],
            },
          },
        },
      },
    });

    return c.json({
      items: rows.map((row) => serializeTemplate(row, row.exercises)),
    });
  })

  .post("/", zValidator("json", createTemplateSchema), async (c) => {
    const authUser = c.get("user");
    const { name, exercises } = c.req.valid("json");

    const created = await db.transaction(async (tx) => {
      const [template] = await tx
        .insert(templates)
        .values({ userId: authUser.id, name })
        .returning();

      for (const [exerciseIndex, exercise] of exercises.entries()) {
        const [insertedExercise] = await tx
          .insert(templateExercises)
          .values({
            templateId: template.id,
            exerciseId: exercise.exerciseId,
            name: exercise.name,
            bodyPart: exercise.bodyPart ?? null,
            restSeconds: exercise.restSeconds,
            position: exerciseIndex,
          })
          .returning();

        if (exercise.sets.length > 0) {
          await tx.insert(templateSets).values(
            exercise.sets.map((set, setIndex) => ({
              templateExerciseId: insertedExercise.id,
              weight: set.weight,
              reps: set.reps,
              position: setIndex,
            }))
          );
        }
      }

      return template;
    });

    const full = await db.query.templates.findFirst({
      where: eq(templates.id, created.id),
      with: {
        exercises: {
          orderBy: [asc(templateExercises.position)],
          with: { sets: { orderBy: [asc(templateSets.position)] } },
        },
      },
    });

    return c.json(serializeTemplate(full!, full!.exercises), 201);
  })

  .get("/:id", async (c) => {
    const authUser = c.get("user");
    const parsed = uuidParam.safeParse(c.req.param("id"));
    if (!parsed.success) {
      return c.json({ error: "Invalid template id" }, 400);
    }

    const template = await db.query.templates.findFirst({
      where: eq(templates.id, parsed.data),
      with: {
        exercises: {
          orderBy: [asc(templateExercises.position)],
          with: { sets: { orderBy: [asc(templateSets.position)] } },
        },
      },
    });

    if (!template) {
      return c.json({ error: "Template not found" }, 404);
    }
    if (template.userId !== authUser.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    return c.json(serializeTemplate(template, template.exercises));
  })

  .delete("/:id", async (c) => {
    const authUser = c.get("user");
    const parsed = uuidParam.safeParse(c.req.param("id"));
    if (!parsed.success) {
      return c.json({ error: "Invalid template id" }, 400);
    }

    const existing = await db.query.templates.findFirst({
      where: eq(templates.id, parsed.data),
      columns: { id: true, userId: true },
    });

    if (!existing) {
      return c.json({ error: "Template not found" }, 404);
    }
    if (existing.userId !== authUser.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await db.delete(templates).where(eq(templates.id, parsed.data));

    return c.json({ id: parsed.data });
  });

export default templatesRoutes;
