import type { Context, Next } from "hono";
import { supabaseAdmin } from "../lib/supabase.js";
import type { AppEnv } from "../types.js";

export async function authMiddleware(c: Context<AppEnv>, next: Next) {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error(`[auth] ${c.req.method} ${c.req.path} - No valid Authorization header (got: ${authHeader ? `"${authHeader.slice(0, 20)}..."` : "none"})`);
    return c.json({ error: "Missing or invalid authorization header" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    console.error(`[auth] ${c.req.method} ${c.req.path} - Token rejected: ${error?.message ?? "no user returned"} (token: ...${token.slice(-10)})`);
    return c.json({ error: "Invalid or expired token" }, 401);
  }

  c.set("user", user);

  await next();
}
