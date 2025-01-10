import { Hono } from "hono";
import JWTAuthChecker from "@backend/handler/AuthenticationHandler.ts";
import { Department } from "@shared/shared_types.ts";
import db from "@backend/service/database.ts";

const department = new Hono();

department.get("/", JWTAuthChecker, (c) => {
  const depts = db.getDepartments();
  if (!(depts instanceof Error)) {
    return c.json(depts, 200);
  }
  return c.json({ message: "Database error" }, 500);
});

department.get("/own_departments", JWTAuthChecker, async (c) => {
  const req = await c.req.json() as ({ user_id: string });
  const depts = db.getDepartmentsOfUser(req.user_id);
  if (!(depts instanceof Error)) {
    return c.json(depts, 200);
  }
});

export default department;
