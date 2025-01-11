import { Hono } from "hono";
import { JWTAuthController } from "../controller/AuthenticationController.ts";
import { Department, Ticket } from "@shared/shared_types.ts";
// import { dbAction, dbDepartments, dbRole, dbUser } from "@backend/model/dbtypes.ts";
import db from "@backend/service/database.ts";
import DatabaseResultController from "../controller/DatabaseController";

const tickets = new Hono();

// get tickets of user
tickets.get("/", JWTAuthController, (c) => {
	// const user_dept = db.getDepartmentsOfUser(c.var.user_id);
	// if ((user_dept instanceof Error)) {
	// 	console.log(user_dept);
	// 	return c.json({ message: "Servererror with provided Data" }, 500);
	// }
	// if (!user_dept.some((d) => d.department_id === parseInt(c.req.param().department_id))) {
	// 	return c.json({ message: "Forbidden" }, 403);
	// }
	const tickets = db.getTicketsOfUser(c.var.user_id);
	DatabaseResultController(c, tickets, tickets, {
		message: "Servererror with provided User ID",
		stauscode: 500,
	});
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
			req.status,
		);
	} else {
		//const images = req.images.forEach((i) => )
		ticket_id = db.addTicket(
			req.title,
			req.description,
			ticket_author.pk_user_id,
			req.status,
		);
	}
	if ((ticket_id instanceof Error)) {
		console.log(ticket_id);
		return c.json({ message: "" }, 500);
	}
	req.departments.forEach((d) => {
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
	});
	return c.json(ticket_id, 200);
});
// get single ticket details and history
// tickets.get("/:ticketid", JWTAuthChecker, async (c) => {
// 	return c.text("", 200);
// });

export default tickets;
