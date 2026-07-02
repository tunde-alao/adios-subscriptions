import "dotenv/config";
import { Hono } from "hono";
import { logger } from "hono/logger";
import api from "./routes/api.js";

const app = new Hono()
  .use("*", logger())
  .get("/", (c) => {
    return c.text("Hello World");
  })
  .route("/api", api);

export default app;

export type AppType = typeof app;
