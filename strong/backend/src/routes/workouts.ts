import { asc, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db/index.js";
import { workoutExercises, workoutSets, workouts } from "../db/schema.js";
import type { AppEnv } from "../types.js";

type WorkoutRow = typeof workouts.$inferSelect;
type WorkoutExerciseRow = typeof workoutExercises.$inferSelect;
type WorkoutSetRow = typeof workoutSets.$inferSelect;

const uuidParam = z.string().uuid();

const workoutSetSchema = z.object({
  weight: z.number().min(0).default(0),
  reps: z.number().int().min(0).default(0),
  completed: z.boolean().default(true),
});

const workoutExerciseSchema = z.object({
  exerciseId: z.string().trim().min(1),
  name: z.string().trim().min(1).max(200),
  bodyPart: z.string().trim().max(100).nullish(),
  sets: z.array(workoutSetSchema).default([]),
});

const createWorkoutSchema = z.object({
  name: z.string().trim().min(1).max(200),
  templateId: z.string().uuid().nullish(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullish(),
  durationSeconds: z.number().int().min(0).default(0),
  totalVolume: z.number().min(0).default(0),
  prCount: z.number().int().min(0).default(0),
  exercises: z.array(workoutExerciseSchema).default([]),
});

function serializeWorkout(
  workout: WorkoutRow,
  exercises: (WorkoutExerciseRow & { sets: WorkoutSetRow[] })[]
) {
  const ordered = [...exercises].sort((a, b) => a.position - b.position);
  return {
    id: workout.id,
    name: workout.name,
    startedAt: workout.startedAt.toISOString(),
    completedAt: workout.completedAt?.toISOString() ?? null,
    durationSeconds: workout.durationSeconds,
    totalVolume: workout.totalVolume,
    prCount: workout.prCount,
    createdAt: workout.createdAt.toISOString(),
    exercises: ordered.map((exercise) => {
      const sets = [...exercise.sets].sort((a, b) => a.position - b.position);
      const bestSet = sets.reduce<WorkoutSetRow | null>((best, set) => {
        if (!best) return set;
        return set.weight * set.reps > best.weight * best.reps ? set : best;
      }, null);
      return {
        id: exercise.id,
        exerciseId: exercise.exerciseId,
        name: exercise.name,
        bodyPart: exercise.bodyPart,
        setCount: sets.length,
        bestSet: bestSet
          ? { weight: bestSet.weight, reps: bestSet.reps }
          : null,
        sets: sets.map((set) => ({
          id: set.id,
          weight: set.weight,
          reps: set.reps,
          completed: set.completed,
        })),
      };
    }),
  };
}

const workoutsRoutes = new Hono<AppEnv>()
  .get("/", async (c) => {
    const authUser = c.get("user");

    const rows = await db.query.workouts.findMany({
      where: eq(workouts.userId, authUser.id),
      orderBy: [desc(workouts.startedAt)],
      with: {
        exercises: {
          orderBy: [asc(workoutExercises.position)],
          with: { sets: { orderBy: [asc(workoutSets.position)] } },
        },
      },
    });

    return c.json({
      items: rows.map((row) => serializeWorkout(row, row.exercises)),
    });
  })

  .post("/", zValidator("json", createWorkoutSchema), async (c) => {
    const authUser = c.get("user");
    const input = c.req.valid("json");

    const created = await db.transaction(async (tx) => {
      const [workout] = await tx
        .insert(workouts)
        .values({
          userId: authUser.id,
          templateId: input.templateId ?? null,
          name: input.name,
          startedAt: new Date(input.startedAt),
          completedAt: input.completedAt ? new Date(input.completedAt) : null,
          durationSeconds: input.durationSeconds,
          totalVolume: input.totalVolume,
          prCount: input.prCount,
        })
        .returning();

      for (const [exerciseIndex, exercise] of input.exercises.entries()) {
        const [insertedExercise] = await tx
          .insert(workoutExercises)
          .values({
            workoutId: workout.id,
            exerciseId: exercise.exerciseId,
            name: exercise.name,
            bodyPart: exercise.bodyPart ?? null,
            position: exerciseIndex,
          })
          .returning();

        if (exercise.sets.length > 0) {
          await tx.insert(workoutSets).values(
            exercise.sets.map((set, setIndex) => ({
              workoutExerciseId: insertedExercise.id,
              weight: set.weight,
              reps: set.reps,
              completed: set.completed,
              position: setIndex,
            }))
          );
        }
      }

      return workout;
    });

    const full = await db.query.workouts.findFirst({
      where: eq(workouts.id, created.id),
      with: {
        exercises: {
          orderBy: [asc(workoutExercises.position)],
          with: { sets: { orderBy: [asc(workoutSets.position)] } },
        },
      },
    });

    return c.json(serializeWorkout(full!, full!.exercises), 201);
  })

  .delete("/:id", async (c) => {
    const authUser = c.get("user");
    const parsed = uuidParam.safeParse(c.req.param("id"));
    if (!parsed.success) {
      return c.json({ error: "Invalid workout id" }, 400);
    }

    const existing = await db.query.workouts.findFirst({
      where: eq(workouts.id, parsed.data),
      columns: { id: true, userId: true },
    });

    if (!existing) {
      return c.json({ error: "Workout not found" }, 404);
    }
    if (existing.userId !== authUser.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await db.delete(workouts).where(eq(workouts.id, parsed.data));

    return c.json({ id: parsed.data });
  });

export default workoutsRoutes;
