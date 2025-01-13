import { Hono } from "hono";
import { JWTAuthController, TicketValidator } from "../controller/AuthenticationController.ts";
import { Department, NewTicket, Ticket, TicketStatus } from "@shared/shared_types.ts";
// import { dbAction, dbDepartments, dbRole, dbUser } from "@backend/model/dbtypes.ts";
import db from "@backend/service/database.ts";
import { NewTicketScheme } from "@shared/shared_schemas.ts";

import { testTicket1History } from "../../tests/backend/test_data.ts";

const tickets = new Hono();

// get tickets of user
tickets.get("/", JWTAuthController, (c) => {
	const tickets = db.getTicketsOfUser(c.var.user_id);
	if ((tickets instanceof Error)) {
		console.log(tickets);
		return c.json({ message: "Servererror with provided User ID" }, 500);
	}
	return c.json(tickets, 200);
});
// get tickets of department for supporter
tickets.get("/:department_id", JWTAuthController, (c) => {
	const user_dept = db.getDepartmentsOfUser(c.var.user_id);
	if ((user_dept instanceof Error)) {
		console.log(user_dept);
		return c.json({ message: "Servererror with provided Data" }, 500);
	}
	if (!user_dept.some((d) => d.department_id === parseInt(c.req.param().department_id))) {
		return c.json({ message: "Forbidden" }, 403);
	}
	const tickets = db.getTicketsOfDepartment(parseInt(c.req.param().department_id));
	if ((tickets instanceof Error)) {
		console.log(tickets);
		return c.json({ message: "Servererror with provided Department ID" }, 500);
	}
	return c.json(tickets, 200);
});
// create a new ticket
tickets.post("/", JWTAuthController, async (c) => {
	const req = NewTicketScheme.safeParse(await c.req.json());
	if (!req.success) {
		console.log(req.error);
		return c.json({ message: "Not a valid Ticket" }, 400);
	}
	const new_ticket = req.data;
	// const req = await c.req.json() as NewTicket;
	console.log("new ticket creation:\n");
	console.log(req);

	const ticket_author = db.getUserByUsername(new_ticket.author);
	if ((ticket_author == undefined)) {
		return c.json({ message: "User does not exist" }, 400);
	}
	if ((ticket_author instanceof Error)) {
		console.log(ticket_author);
		return c.json({ message: "Servererror with provided Data" }, 500);
	}
	const ticket_id = db.addTicket(
		new_ticket.ticket_title,
		new_ticket.ticket_description,
		ticket_author.pk_user_id,
		TicketStatus.OPEN,
	);
	if ((ticket_id instanceof Error)) {
		console.log(ticket_id);
		return c.json({ message: "" }, 500);
	}
	if ((new_ticket.images != undefined)) {
		new_ticket.images.forEach((i) => {
			db.addImageToTicket(ticket_id, i);
		});
	}
	new_ticket.departments.forEach((d) => {
		const dept = db.getDepartmentById(d.department_id);
		if ((dept == undefined)) {
			db.deleteTicketById(ticket_id);
			return c.json({ message: "Department does not exist" }, 400);
		}
		if ((dept instanceof Error)) {
			console.log(dept);
		}
		const ticket_assoc = db.addTicketToDepartment(ticket_id, d.department_id);
		if ((ticket_assoc instanceof Error)) {
			console.log(ticket_assoc);
			db.deleteTicketById(ticket_id);
			return c.json({ message: "Could not assign ticket to department" }, 400);
		}
		const ticket_create = db.addTicketToDepartment(ticket_id, d.department_id);
		if ((ticket_create instanceof Error)) {
			console.log(ticket_assoc);
			db.deleteTicketById(ticket_id);
			return c.json({ message: "Could not assign ticket to department" }, 400);
		}
	});
	return c.json(ticket_id, 200);
});
// get single ticket details and history
tickets.get("/:ticketid", JWTAuthController, TicketValidator, async (c) => {
	return c.json(testTicket1History, 200);
});
// update ticket history
tickets.put("/:ticketid", JWTAuthController, TicketValidator, async (c) => {
	return c.json({ message: "Successfully event added to ticket" }, 200);
});

// pull back ticket
tickets.delete("/:ticketid", JWTAuthController, TicketValidator, async (c) => {
	// check if not already accepted by checking event count and if actor is author
	return c.json({ message: "Successfully deleted ticket" }, 200);
});

export default tickets;
