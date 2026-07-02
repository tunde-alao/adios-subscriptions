import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db/index.js";
import { tasks } from "../db/schema.js";
import { TASK_IMAGES_BUCKET, getTaskImageUrl } from "../lib/get-task-image-url.js";
import { supabaseAdmin } from "../lib/supabase.js";
import type { AppEnv } from "../types.js";

const uuidParam = z.string().uuid();

const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  imagePath: z.string().trim().min(1).optional(),
});

const updateTaskSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    completed: z.boolean().optional(),
  })
  .refine(
    (data) => data.title !== undefined || data.completed !== undefined,
    { message: "Must provide title or completed" }
  );

async function serializeTask(task: typeof tasks.$inferSelect) {
  return {
    id: task.id,
    title: task.title,
    completed: task.completed,
    imageUrl: await getTaskImageUrl(task.imagePath),
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}

const tasksRoutes = new Hono<AppEnv>()
  .get("/", async (c) => {
    const authUser = c.get("user");

    const rows = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, authUser.id))
      .orderBy(desc(tasks.createdAt));

    return c.json({ items: await Promise.all(rows.map(serializeTask)) });
  })

  .post("/", zValidator("json", createTaskSchema), async (c) => {
    const authUser = c.get("user");
    const { title, imagePath } = c.req.valid("json");

    const [created] = await db
      .insert(tasks)
      .values({
        userId: authUser.id,
        title,
        imagePath: imagePath ?? null,
      })
      .returning();

    return c.json(await serializeTask(created), 201);
  })

  .patch("/:id", zValidator("json", updateTaskSchema), async (c) => {
    const authUser = c.get("user");
    const id = c.req.param("id");
    const updates = c.req.valid("json");

    const parsed = uuidParam.safeParse(id);
    if (!parsed.success) {
      return c.json({ error: "Invalid task id" }, 400);
    }

    const existing = await db.query.tasks.findFirst({
      where: eq(tasks.id, parsed.data),
      columns: { id: true, userId: true },
    });

    if (!existing) {
      return c.json({ error: "Task not found" }, 404);
    }

    if (existing.userId !== authUser.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const [updated] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, parsed.data))
      .returning();

    return c.json(await serializeTask(updated));
  })

  .delete("/:id", async (c) => {
    const authUser = c.get("user");
    const id = c.req.param("id");

    const parsed = uuidParam.safeParse(id);
    if (!parsed.success) {
      return c.json({ error: "Invalid task id" }, 400);
    }

    const existing = await db.query.tasks.findFirst({
      where: eq(tasks.id, parsed.data),
      columns: { id: true, userId: true, imagePath: true },
    });

    if (!existing) {
      return c.json({ error: "Task not found" }, 404);
    }

    if (existing.userId !== authUser.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    if (existing.imagePath) {
      await supabaseAdmin.storage
        .from(TASK_IMAGES_BUCKET)
        .remove([existing.imagePath])
        .catch((err) => {
          console.error("Failed to delete task image from storage:", err);
        });
    }

    await db.delete(tasks).where(eq(tasks.id, parsed.data));

    return c.json({ id: parsed.data });
  });

export default tasksRoutes;
