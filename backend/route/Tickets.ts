import { Hono } from "hono";
import JWTAuthChecker from "../handler/AuthenticationHandler.ts";
import { Ticket } from "../../shared_types/communication_types.ts";
import { jwt_payload } from "../model/api_types.ts";
import db from "../service/database.ts";

const tickets = new Hono();
const renameKeys = (keysMap, obj) =>
  Object.keys(obj).reduce(
    (acc, key) => ({
      ...acc,
      ...{ [keysMap[key] || key]: obj[key] },
    }),
    {},
  );

// get tickets of department
tickets.get("/", JWTAuthChecker, async (c) => {
  const req = await c.req.json() as ({ department_id: number });
  const tickets = db.getTicketsOfDepartment(req.department_id);
  if (!(tickets instanceof Error)) {
    return c.json(tickets, 200);
  }
});

export default tickets;
