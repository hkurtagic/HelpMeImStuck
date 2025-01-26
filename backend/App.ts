import { Hono } from "hono";
import { logger } from "hono/logger";
// import { cors } from "hono/cors";
import user from "@backend/route/User.ts";
// import database from "@backend/service/database.ts";
import role from "@backend/route/Role.ts";
import department from "@backend/route/Department.ts";
import ticket from "@backend/route/Ticket.ts";

const app: Hono = new Hono().basePath("/api");

/* Custom logger https://hono.dev/docs/middleware/builtin/logger */
app.use(logger());
// set cors policy

// app.use(
//   "*",
//   /*cors({
//     origin: (origin, c) => {
//       return origin.includes("localhost") ? origin : "http://localhost:*";
//     },
//     // allowMethods: ['POST', 'GET', 'OPTIONS'],
//     // exposeHeaders: ['Set-Cookie'],
//     credentials: true,
//   }),*/
// );

app.route("/user", user);

app.route("/department", department);
app.route("/role", role);
app.route("/ticket", ticket);

export default app;
