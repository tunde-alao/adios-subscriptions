import { and, asc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db/index.js";
import { foodEntries, meals } from "../db/schema.js";
import type { AppEnv } from "../types.js";

const uuidParam = z.string().uuid();
const dateParam = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const createFoodEntrySchema = z.object({
  name: z.string().trim().min(1).max(200),
  brand: z.string().trim().max(200).optional(),
  barcode: z.string().trim().max(64).optional(),
  meal: z.enum(meals),
  servingLabel: z.string().trim().min(1).max(120),
  numberOfServings: z.number().positive().max(1000),
  caloriesPerServing: z.number().min(0),
  carbsPerServing: z.number().min(0),
  fatPerServing: z.number().min(0),
  proteinPerServing: z.number().min(0),
  loggedDate: dateParam,
});

const updateFoodEntrySchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  meal: z.enum(meals).optional(),
  servingLabel: z.string().trim().min(1).max(120).optional(),
  numberOfServings: z.number().positive().max(1000).optional(),
  caloriesPerServing: z.number().min(0).optional(),
  carbsPerServing: z.number().min(0).optional(),
  fatPerServing: z.number().min(0).optional(),
  proteinPerServing: z.number().min(0).optional(),
  loggedDate: dateParam.optional(),
});

function serializeFoodEntry(entry: typeof foodEntries.$inferSelect) {
  return {
    id: entry.id,
    name: entry.name,
    brand: entry.brand,
    barcode: entry.barcode,
    meal: entry.meal,
    servingLabel: entry.servingLabel,
    numberOfServings: Number(entry.numberOfServings),
    caloriesPerServing: Number(entry.caloriesPerServing),
    carbsPerServing: Number(entry.carbsPerServing),
    fatPerServing: Number(entry.fatPerServing),
    proteinPerServing: Number(entry.proteinPerServing),
    loggedDate: entry.loggedDate,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

const foodEntriesRoutes = new Hono<AppEnv>()
  .get("/", zValidator("query", z.object({ date: dateParam })), async (c) => {
    const authUser = c.get("user");
    const { date } = c.req.valid("query");

    const rows = await db
      .select()
      .from(foodEntries)
      .where(
        and(eq(foodEntries.userId, authUser.id), eq(foodEntries.loggedDate, date))
      )
      .orderBy(asc(foodEntries.createdAt));

    return c.json({ items: rows.map(serializeFoodEntry) });
  })

  .post("/", zValidator("json", createFoodEntrySchema), async (c) => {
    const authUser = c.get("user");
    const body = c.req.valid("json");

    const [created] = await db
      .insert(foodEntries)
      .values({
        userId: authUser.id,
        name: body.name,
        brand: body.brand ?? null,
        barcode: body.barcode ?? null,
        meal: body.meal,
        servingLabel: body.servingLabel,
        numberOfServings: body.numberOfServings.toString(),
        caloriesPerServing: body.caloriesPerServing.toString(),
        carbsPerServing: body.carbsPerServing.toString(),
        fatPerServing: body.fatPerServing.toString(),
        proteinPerServing: body.proteinPerServing.toString(),
        loggedDate: body.loggedDate,
      })
      .returning();

    return c.json(serializeFoodEntry(created), 201);
  })

  .patch("/:id", zValidator("json", updateFoodEntrySchema), async (c) => {
    const authUser = c.get("user");
    const id = c.req.param("id");
    const updates = c.req.valid("json");

    const parsed = uuidParam.safeParse(id);
    if (!parsed.success) {
      return c.json({ error: "Invalid food entry id" }, 400);
    }

    const existing = await db.query.foodEntries.findFirst({
      where: eq(foodEntries.id, parsed.data),
      columns: { id: true, userId: true },
    });

    if (!existing) {
      return c.json({ error: "Food entry not found" }, 404);
    }

    if (existing.userId !== authUser.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const [updated] = await db
      .update(foodEntries)
      .set({
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.meal !== undefined && { meal: updates.meal }),
        ...(updates.servingLabel !== undefined && {
          servingLabel: updates.servingLabel,
        }),
        ...(updates.numberOfServings !== undefined && {
          numberOfServings: updates.numberOfServings.toString(),
        }),
        ...(updates.caloriesPerServing !== undefined && {
          caloriesPerServing: updates.caloriesPerServing.toString(),
        }),
        ...(updates.carbsPerServing !== undefined && {
          carbsPerServing: updates.carbsPerServing.toString(),
        }),
        ...(updates.fatPerServing !== undefined && {
          fatPerServing: updates.fatPerServing.toString(),
        }),
        ...(updates.proteinPerServing !== undefined && {
          proteinPerServing: updates.proteinPerServing.toString(),
        }),
        ...(updates.loggedDate !== undefined && {
          loggedDate: updates.loggedDate,
        }),
        updatedAt: new Date(),
      })
      .where(eq(foodEntries.id, parsed.data))
      .returning();

    return c.json(serializeFoodEntry(updated));
  })

  .delete("/:id", async (c) => {
    const authUser = c.get("user");
    const id = c.req.param("id");

    const parsed = uuidParam.safeParse(id);
    if (!parsed.success) {
      return c.json({ error: "Invalid food entry id" }, 400);
    }

    const existing = await db.query.foodEntries.findFirst({
      where: eq(foodEntries.id, parsed.data),
      columns: { id: true, userId: true },
    });

    if (!existing) {
      return c.json({ error: "Food entry not found" }, 404);
    }

    if (existing.userId !== authUser.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    await db.delete(foodEntries).where(eq(foodEntries.id, parsed.data));

    return c.json({ id: parsed.data });
  });

export default foodEntriesRoutes;
