import { Context, Hono } from "hono";
import { ValidationFunction, validator } from "hono/validator";
import { AuthPrep, JWTAuthController } from "@backend/controller/AuthenticationController.ts";
import {
    DepartmentIDValidator,
    TicketEventValidator,
    TicketIDValidator,
} from "@backend/controller/ValidationController.ts";
import { ID, S_Ticket, S_TicketCreate } from "@shared/shared_schemas.ts";
import * as dbController from "@backend/service/dbController.ts";

import {
    Actions,
    Department,
    EventType,
    Ticket,
    TicketCreate,
    TicketStatus,
} from "@shared/shared_types.ts";
import {
    S_ActionsPerDepartment,
    S_ServerTicket,
} from "@backend/schemes_and_types/serverside_schemas.ts";
import { ActionsPerDepartment } from "@backend/schemes_and_types/serverside_types.ts";
const ticket = new Hono();

// get all tickets of acting user
ticket.get("/", JWTAuthController, async (c) => {
    const tickets = await dbController.getAllTicketsOf({ author_id: c.var.user_id });
    if (!tickets) {
        return c.json({ message: "No Tickets found" }, 400);
    }
    return c.json(tickets, 200);
});

// get all tickets in department
ticket.get(
    "/dept/:department_id",
    JWTAuthController,
    AuthPrep,
    DepartmentIDValidator(),
    async (c) => {
        const auth = Object.entries(c.var.allowed_actions_per_department as ActionsPerDepartment)
            .some(([dept_id, a]) =>
                (a as Actions[]).some((
                    x,
                ) => (x === Actions.ticket_seeDepartmentTickets &&
                    (c.req.valid("param") === parseInt(dept_id)))
                )
            );
        if (!auth) {
            return c.json({ error: "Forbidden!" }, 403);
        }
        const tickets = await dbController.getAllTicketsOf({ department_id: c.req.valid("param") });
        return c.json(tickets, 200);
    },
);

// create new ticket
ticket.post(
    "/",
    JWTAuthController,
    AuthPrep,
    validator("json", (value, c) => {
        const parsed = S_TicketCreate.safeParse(value);
        if (!parsed.success) {
            console.error(parsed.error);
            return c.json({ message: "Not a valid Ticket Object" }, 400);
        }
        return parsed.data;
    }),
    async (c) => {
        const auth = Object.entries(c.var.allowed_actions_per_department as ActionsPerDepartment)
            .some(([dept_id, a]) =>
                (a as Actions[]).some((
                    x,
                ) => (x === Actions.ticket_create &&
                    (c.req.valid("json").author.user_id === c.var.user_id))
                )
            );
        if (!auth) {
            return c.json({ error: "Forbidden!" }, 403);
        }
        const ticket_create_success = await dbController.addTicket(c.req.valid("json"));
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
    AuthPrep,
    TicketIDValidator(),
    async (c) => {
        // TODO check if user is in department of ticket AND is allowed to see it
        // TODO check if user is owner of ticket
        const ticket = await dbController.getTicket(c.req.valid("param"));

        const auth = Object.entries(c.var.allowed_actions_per_department as ActionsPerDepartment)
            .some(([dept_id, a]) =>
                (a as Actions[]).some((x) =>
                    (x === Actions.ticket_seeDepartmentTickets &&
                        (ticket?.departments.some((d) => d.department_id === parseInt(dept_id)))) ||
                    (ticket?.author.user_id === c.var.user_id)
                )
            );
        if (!auth) {
            return c.json({ error: "Forbidden!" }, 403);
        }
        const ticketHistory = await dbController.getTicketHistory(c.req.valid("param"));
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
    AuthPrep,
    TicketIDValidator(),
    TicketEventValidator(),
    async (c) => {
        if (c.req.valid("param") != c.req.valid("json").ticket_id) {
            return c.json({ message: "Ticket ID of path and Event does not match!" }, 400);
        }
        const new_event = c.req.valid("json");
        const ticket = await dbController.getTicket(c.req.valid("param"));
        if (!ticket) {
            return c.json({ error: "Ticket does not exist!" }, 400);
        }
        const event_user = await dbController.getUser({ user_id: new_event.author.user_id });
        if (ticket?.author.user_id === event_user?.user_id) {
            if (
                !((new_event.event_type === EventType.statusChange &&
                    new_event.new_status === TicketStatus.CLOSED) ||
                    new_event.event_type === EventType.comment)
            ) {
                return c.json({ error: "Forbidden!" }, 403);
            }
        }
        // cant add anything to ticket if it was closed
        if (ticket?.ticket_status === TicketStatus.CLOSED) {
            return c.json({ error: "Forbidden!" }, 403);
        }
        // check if ticket is in multiple departments
        // let close_ticket = true;
        // if (ticket.departments.length > 1 && ) {
        //     const ticketHistory = await dbController.getTicketHistory(ticket.ticket_id);
        //     if (ticketHistory) {
        //         // find all added departments
        //         const all_other_closed_departments = ticket.departments.filter((d) =>
        //             ticketHistory.events.filter((e) =>
        //                 e.event_type === EventType.statusChange &&
        //                 e.new_status === TicketStatus.CLOSED
        //             ).map((e) => parseInt(e.description!)).includes(d.department_id)
        //         ).map(d => d.department_id);
        //         if(ticket.departments.every(d =>(all_other_closed_departments.some(cD => cD=== d.department_id)||(
        //             new_event.event_type === EventType.statusChange &&
        //             e.new_status === TicketStatus.CLOSED)))
        //         console.log("multi department close")
        //         console.log(all_other_closed_departments)
        //         // const close_ticket = new_event.event_type === EventType.statusChange  &&
        //     }
        // }

        const event_added_success = await dbController.addEvent(new_event);
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
    AuthPrep,
    TicketIDValidator(),
    async (c) => {
        //check if ticket exists
        const ticket = await dbController.getTicket(c.req.valid("param"));

        if (!ticket) {
            return c.json({ message: "Ticket does not exist" }, 400);
        }
        const auth = Object.entries(c.var.allowed_actions_per_department as ActionsPerDepartment)
            .some(([dept_id, a]) =>
                (a as Actions[]).some((x) => (x === Actions.ticket_pullBack &&
                    (ticket.author.user_id === c.var.user_id))
                )
            );
        if (!auth) {
            return c.json({ error: "Forbidden!" }, 403);
        }
        // check if ticket has not been accepted
        const ticket_history = await dbController.getTicketHistory(c.req.valid("param"));
        if (!ticket_history) {
            return c.json({ message: "Serverside error" }, 500);
        }
        // cant delete if status not open or if another user has added a TicketEvent
        if (
            ticket.ticket_status !== TicketStatus.OPEN &&
            ticket_history.events.findIndex((e) => e.author !== ticket.author) > -1
        ) {
            return c.json({ message: "Ticket deletion not possible anymore" }, 403);
        }

        const ticket_delete_success = await dbController.deleteTicket(c.req.valid("param"));
        if (!ticket_delete_success) {
            return c.json({ message: "Ticket deletion failed" }, 500);
        }
        return c.json({ message: "Successfully deleted Ticket" }, 200);
    },
);

export default ticket;
