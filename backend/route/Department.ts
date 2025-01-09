import { Hono } from "npm:hono@4.6.14";
import JWTAuthChecker from "../handler/AuthenticationHandler.ts";
import { Department } from "../../shared_types/communication_types.ts";
import { jwt_payload } from "../model/api_types.ts";
import db from "../service/database.ts";

const department = new Hono();
const renameKeys = (keysMap, obj) =>
  Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      ...{ [keysMap[key] || key]: obj[key] },
    }),
    {},
  );

department.get("/", JWTAuthChecker, async (c) => {
  const depts = db.getDepartments();
  if (!(depts instanceof Error)) {
    depts.forEach((element) => {
      renameKeys({
        pk_department_id: "department_id",
        department_name: "department_name",
      }, element);
      const keyToRemove: keyof typeof element = "description";
      delete element[keyToRemove];
    });
    return c.json(depts, 200);
  }
});

department.get("/own_departments", JWTAuthChecker, async (c) => {
  const req = await c.req.json() as ({ user_id: string });
  const depts = db.getDepartmentsOfUser(req.user_id);
  if (!(depts instanceof Error)) {
    return c.json(depts, 200);
  }
});

export default department;
