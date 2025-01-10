import { Hono } from "hono";
import { logger } from "hono/logger";
// import { cors } from "hono/cors";
import login from "@backend/route/Login.ts";
import test from "@backend/route/Test.ts";
import database from "@backend/service/database.ts";
import logout from "@backend/route/Logout.ts";
import department from "@backend/route/Department.ts";
import tickets from "@backend/route/Tickets.ts";

const app = new Hono().basePath("/api");
database.initDB();

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

app.route("/login", login);
app.route("/logout", logout);

app.route("/department", department);
app.route("/ticket", tickets);

app.route("/test", test);

export default app;
