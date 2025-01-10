import { Hono } from "hono";
import JWTAuthChecker from "@backend/handler/AuthenticationHandler.ts";
import { Ticket } from "@shared/shared_types.ts";
import { dbAction, dbDepartments, dbRole, dbUser } from "@backend/model/dbtypes.ts";
import db from "@backend/service/database.ts";

const tickets = new Hono();
// get tickets of department
tickets.get("/", JWTAuthChecker, async (c) => {
	const req = await c.req.json() as ({ department_name: string });
	const dept = db.getDepartmentIdByName(req.department_name);
	if ((dept == undefined)) {
		return c.json({ message: "Department does not exist" }, 400);
	}
	const tickets = db.getTicketsOfDepartment(dept.department_id);
	if (!(tickets instanceof Error)) {
		return c.json(tickets, 200);
	}
});
// create a new ticket
tickets.post("/create", JWTAuthChecker, async (c) => {
	const req = await c.req.json() as Ticket;
	console.log("new ticket creation:\n");
	console.log(req);

	const ticket_author = db.getUserByUsername(req.author);
	if ((ticket_author == undefined)) {
		return c.json({ message: "User does not exist" }, 400);
	}
	if ((ticket_author instanceof Error)) {
		console.log(ticket_author);
		return c.json({ message: "Servererror with provided Data" }, 500);
	}
	let ticket_id = undefined;
	if ((req.images == undefined)) {
		ticket_id = db.addTicket(
			req.title,
			req.description,
			ticket_author.pk_user_id,
		);
	} else {
		//const images = req.images.forEach((i) => )
		ticket_id = db.addTicket(
			req.title,
			req.description,
			ticket_author.pk_user_id,
		);
	}
	if ((ticket_id instanceof Error)) {
		console.log(ticket_id);
		return c.json({ message: "" }, 500);
	}
	return c.json(ticket_id, 200);
});
// get single ticket details and history
tickets.get("/:ticketid", JWTAuthChecker, async (c) => {
	return c.text("", 200);
});

export default tickets;
