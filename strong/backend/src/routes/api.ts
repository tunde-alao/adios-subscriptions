import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";
import templatesRoutes from "./templates.js";
import workoutsRoutes from "./workouts.js";

const updateMeSchema = z.object({
  fullName: z.string().trim().min(1).max(200).optional(),
  isOnboardingComplete: z.boolean().optional(),
});

const api = new Hono<AppEnv>()
  .use("*", authMiddleware)
  .post("/signin", async (c) => {
    const authUser = c.get("user");

    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });

    if (existingUser) {
      return c.json(existingUser);
    }

    const [newUser] = await db
      .insert(users)
      .values({
        id: authUser.id,
        email: authUser.email!,
        fullName: authUser.user_metadata?.full_name ?? null,
      })
      .returning();

    return c.json(newUser);
  })
  .route("/templates", templatesRoutes)
  .route("/workouts", workoutsRoutes)
  .get("/me", async (c) => {
    const authUser = c.get("user");

    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, authUser.id),
    });

    return c.json({
      id: authUser.id,
      email: authUser.email,
      fullName: dbUser?.fullName ?? null,
      isOnboardingComplete: dbUser?.isOnboardingComplete ?? false,
    });
  })
  .patch("/me", zValidator("json", updateMeSchema), async (c) => {
    const authUser = c.get("user");
    const updates = c.req.valid("json");

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, authUser.id))
      .returning();

    return c.json({
      id: authUser.id,
      email: authUser.email,
      fullName: updated?.fullName ?? null,
      isOnboardingComplete: updated?.isOnboardingComplete ?? false,
    });
  })
  .get("/health", (c) => {
    return c.json({ status: "ok", authenticated: true });
  });

export default api;
