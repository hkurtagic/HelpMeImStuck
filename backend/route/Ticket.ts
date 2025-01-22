import { Context, Hono } from "hono";
import { ValidationFunction, validator } from "hono/validator";
import { JWTAuthController } from "@backend/controller/AuthenticationController.ts";
import {
    DepartmentIDValidator,
    TicketEventValidator,
    TicketIDValidator,
} from "@backend/controller/ValidationController.ts";
import { ID, S_Ticket, S_TicketCreate } from "@shared/shared_schemas.ts";
import * as db2 from "@backend/service/dbController.ts";

import { Department, Ticket, TicketCreate, TicketStatus } from "@shared/shared_types.ts";
import { S_ServerTicket } from "@backend/schemes_and_types/serverside_schemas.ts";
const ticket = new Hono();

// get all tickets of acting user
ticket.get("/", JWTAuthController, (c) => {
    const tickets = db2;
    if (!tickets) {
        return c.json({ message: "No Tickets found" }, 400);
    }
    return c.json(tickets, 200);
});

// get all tickets in department
ticket.get(
    "/dept/:department_id",
    JWTAuthController,
    DepartmentIDValidator(),
    (c) => {
        const tickets = db2.getAllTicketsOf({ department_id: c.req.valid("param") });
        return c.json(tickets, 200);
    },
);

// create new ticket
ticket.post(
    "/",
    JWTAuthController,
    validator("json", (value, c) => {
        const parsed = S_TicketCreate.safeParse(value);
        if (!parsed.success) {
            console.error(parsed.error);
            return c.json({ message: "Not a valid Ticket Object" }, 400);
        }
        return parsed.data;
    }),
    async (c) => {
        const ticket_create_success = await db2.addTicket(c.req.valid("json"));
        if (!ticket_create_success) {
            return c.json({ message: "Ticket creation failed" }, 500);
        }
        return c.json({ message: "Successfully created User" }, 200);
    },
);

// get TicketHistory of one ticket
ticket.get(
    "/:ticket_id",
    JWTAuthController,
    TicketIDValidator(),
    async (c) => {
        // TODO check if user is in department of ticket AND is allowed to see it
        // TODO check if user is owner of ticket
        const ticketHistory = await db2.getTicketHistory(c.req.valid("param"));
        if (!ticketHistory) {
            console.error(c.req.valid("param"));
            return c.json({ error: "No TicketHistory found" }, 500);
        }
        return c.json(ticketHistory, 200);
    },
);

// modify
ticket.put(
    "/:ticket_id",
    JWTAuthController,
    TicketIDValidator(),
    TicketEventValidator(),
    async (c) => {
        if (c.req.valid("param") != c.req.valid("json").ticket_id) {
            return c.json({ message: "Ticket ID of path and Event does not match!" }, 400);
        }
        // const ticket_id = new_ticketEvent.ticket_id
        const event_added_success = await db2.addEvent(c.req.valid("json"));
        if (!event_added_success) {
            return c.json({ message: "TicketEvent could not be added!" }, 500);
        }
        return c.json({ message: "Successfully added TicketEvent" }, 200);
    },
);
// delete
ticket.delete(
    "/:ticket_id",
    JWTAuthController,
    TicketIDValidator(),
    async (c) => {
        //check if ticket exists
        const ticket = S_ServerTicket.safeParse(
            (await db2.getTicket(c.req.valid("param"))).toJSON(),
        );
        if (!ticket.success) {
            return c.json({ message: "Ticket does not exist" }, 400);
        }
        // check if ticket has not been accepted
        const ticket_history = await db2.getTicketHistory(c.req.valid("param"));
        if (!ticket_history) {
            return c.json({ message: "Serverside error" }, 500);
        }
        // cant delete if status not open or if another user has added a TicketEvent
        if (
            ticket.data.ticket_status !== TicketStatus.OPEN &&
            ticket_history.events.findIndex((e) => e.author !== ticket.data.author) > -1
        ) {
            return c.json({ message: "Ticket deletion not possible anymore" }, 403);
        }

        const ticket_delete_success = await db2.deleteTicket(c.req.valid("param"));
        if (!ticket_delete_success) {
            return c.json({ message: "Ticket deletion failed" }, 500);
        }
        return c.json({ message: "Successfully deleted Ticket" }, 200);
    },
);

export default ticket;
