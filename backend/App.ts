import { Hono } from "hono";
import { logger } from "hono/logger";
import login from "@backend/route/Login.ts";
import test from "@backend/route/Example.ts";
import { cors } from "hono/cors";
import database from "@backend/service/database.ts";
import logout from "@backend/route/Logout.ts";

const app: Hono = new Hono().basePath("/api");

/* Custom logger https://hono.dev/docs/middleware/builtin/logger */
app.use(logger());
// set cors policy

app.use(
  "*",
  cors({
    origin: (origin, c) => {
      return origin.includes("localhost") ? origin : "http://localhost";
    },
    // allowMethods: ['POST', 'GET', 'OPTIONS'],
    // exposeHeaders: ['Set-Cookie'],
    credentials: true,
  }),
);

app.route("/login", login);
app.route("/logout", logout);

app.route("/test", test);

export default app;
