import { Hono } from "hono";
import { validator } from "hono/validator";
import { JWTAuthController } from "@backend/controller/Test.AuthenticationController.ts";
import {
	Actions,
	Department,
	LoginUser,
	NewRole,
	NewTicket,
	NewUser,
	User,
} from "@shared/shared_types.ts";
import {
	ID,
	NewRoleScheme,
	NewTicketScheme,
	NewUserScheme,
	RoleScheme,
	TicketEventScheme,
	TicketHistoryScheme,
	TicketScheme,
	zIDparam,
	zUUIDparam,
} from "@shared/shared_schemas.ts";
import { getTestData, setTestData } from "../../tests/backend/sync.ts";
// import {
// 	DepartmentScheme,
// 	TestDepartmentScheme,
// 	TestUserScheme,
// } from "../../shared/shared_schemas.ts";
import { Role, TicketEvent, TicketStatus } from "@shared/shared_types.ts";

const ticket = new Hono();
const testData = getTestData();

// get all tickets of acting user
ticket.get("/", JWTAuthController, (c) => {
	const tickets = testData.tickets.find((t) => t.author.user_id === c.var.user_id);
	if (!tickets) {
		return c.json({ message: "No Tickets found" }, 400);
	}
	return c.json(tickets, 200);
});

// get all tickets in department
ticket.get(
	"/dept/:department_id",
	JWTAuthController,
	validator("param", (value, c) => {
		const parsed = zIDparam.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Department ID" }, 400);
		}
		return parsed.data;
	}),
	(c) => {
		const tickets = testData.tickets.filter((t) =>
			t.departments.filter((d) => d.department_id === c.req.valid("param"))
		);
		if (!tickets) {
			console.log(c.req.valid("param"));
			return c.json({ error: "No Tickets in Department" }, 500);
		}
		return c.json(tickets, 200);
	},
);

// create new ticket
ticket.post(
	"/",
	JWTAuthController,
	validator("json", (value, c) => {
		const parsed = NewTicketScheme.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Ticket Object" }, 400);
		}
		return parsed.data as NewTicket;
	}),
	(c) => {
		const new_ticket = c.req.valid("json");
		testData.tickets.push({
			ticket_id: (testData.tickets.length + 1).toString(),
			ticket_status: TicketStatus.OPEN,
			...new_ticket,
		});
		setTestData(testData);
		return c.json({ message: "Successfully created Ticket" }, 200);
	},
);

// get TicketHistory of one ticket
ticket.get(
	"/:ticket_id",
	JWTAuthController,
	validator("param", (value, c) => {
		const parsed = zUUIDparam.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Ticket ID" }, 400);
		}
		return parsed.data;
	}),
	(c) => {
		// TODO check if user is in department of ticket AND is allowed to see it
		// TODO check if user is owner of ticket
		const ticketHistory = testData.ticketHistories.filter((th) =>
			th.ticket_id === c.req.valid("param")
		);
		if (!ticketHistory) {
			console.log(c.req.valid("param"));
			return c.json({ error: "No TicketHistory found" }, 500);
		}
		return c.json(ticketHistory, 200);
	},
);

// modify
ticket.put(
	"/:ticket_id",
	JWTAuthController,
	validator("json", (value, c) => {
		const parsed = TicketEventScheme.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid TicketEvent" }, 400);
		}
		return parsed.data;
	}),
	(c) => {
		const new_ticketEvent = c.req.valid("json") as TicketEvent;
		// const ticket_id = new_ticketEvent.ticket_id
		const index = testData.ticketHistories.findIndex((th) =>
			th.ticket_id === new_ticketEvent.ticket_id
		);
		if (index < 1) {
			console.log(new_ticketEvent.ticket_id);
			return c.json({ message: "Serverside error" }, 500);
		}
		// const new_ticketHistoryEvent = TicketEventScheme.safeParse(new_ticketEvent)
		// if(!new_ticketHistoryEvent.success){
		//     console.log(new_ticketHistoryEvent.error)
		// 	return c.json({ message: "Serverside parsing error" }, 500);
		// }
		// const th = new_ticketHistoryEvent.data
		testData.ticketHistories[index].events.push(new_ticketEvent);
		// setTestData(testData);

		return c.json({ message: "Successfully added TicketEvent" }, 200);
	},
);
// delete
ticket.delete(
	"/:ticket_id",
	JWTAuthController,
	validator("param", (value, c) => {
		const parsed = zUUIDparam.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Ticket ID" }, 400);
		}
		return parsed.data;
	}),
	(c) => {
		testData.tickets.splice(
			testData.tickets.findIndex((t) => t.ticket_id === c.req.valid("param")),
		);
		setTestData(testData);
		return c.json({ message: "Successfully deleted Ticket" }, 200);
	},
);

export default ticket;
