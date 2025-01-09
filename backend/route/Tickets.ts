import { Hono } from "hono";
import JWTAuthChecker from "@backend/handler/AuthenticationHandler.ts";
import { Ticket } from "@shared/shared_types.ts";
import {
  dbAction,
  dbDepartments,
  dbRole,
  dbUser,
} from "@backend/model/dbtypes.ts";
import db from "@backend/service/database.ts";

const tickets = new Hono();
// get tickets of department
tickets.get("/", JWTAuthChecker, async (c) => {
  const req = await c.req.json() as ({ department_id: number });
  const tickets = db.getTicketsOfDepartment(req.department_id);
  if (!(tickets instanceof Error)) {
    return c.json(tickets, 200);
  }
});
tickets.get("/create", JWTAuthChecker, async (c) => {
  const req = await c.req.json() as Ticket;
  const author_id = db.getUserByUsername(req.author);
  if ((author_id == undefined)) {
    return c.json({ message: "User does not exist" }, 400);
  }
  if ((author_id instanceof Error)) {
    console.log(author_id);
    return c.json({ message: "Servererror with provided Data" }, 500);
  }
  const tickets = db.addTicket(
    req.title,
    req.description,
    author_id.pk_user_id,
    req.images,
  );
  return c.json(tickets, 200);
});

export default tickets;
