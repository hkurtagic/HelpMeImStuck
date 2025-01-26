import { Context } from "hono";
import { ValidationFunction, validator } from "hono/validator";
import { S_Department, S_TicketEvent, zIDparam, zUUIDparam } from "@shared/shared_schemas.ts";

function UserIDValidator() {
    return validator("param", (value: ValidationFunction<string, string>, c: Context) => {
        const parsed = zUUIDparam.safeParse(value);
        if (!parsed.success) {
            return c.json({ message: "Not a valid User ID!" }, 400);
        }
        return parsed.data;
    });
}

function TicketIDValidator() {
    return validator("param", (value: ValidationFunction<string, string>, c: Context) => {
        const parsed = zUUIDparam.safeParse(value);
        if (!parsed.success) {
            return c.json({ message: "Not a valid Ticket ID!" }, 400);
        }
        return parsed.data;
    });
}
function TicketEventValidator() {
    return validator("json", (value: ValidationFunction<string, string>, c: Context) => {
        const parsed = S_TicketEvent.safeParse(value);
        if (!parsed.success) {
            console.error(parsed.error);
            return c.json({ message: "Not a valid TicketEvent object!" }, 400);
        }
        return parsed.data;
    });
}
function DepartmentIDValidator() {
    return validator("param", (value: ValidationFunction<string, string>, c: Context) => {
        const parsed = zIDparam.safeParse(value);
        if (!parsed.success) {
            return c.json({ message: "Not a valid Department ID!" }, 400);
        }
        return parsed.data;
    });
}
function DepartmentObjectValidator() {
    return validator("json", (value: ValidationFunction<string, string>, c: Context) => {
        const parsed = S_Department.safeParse(value);
        if (!parsed.success) {
            console.error(parsed.error);
            return c.json({ message: "Not a valid Department object!" }, 400);
        }
        return parsed.data;
    });
}
function RoleIDValidator() {
    return validator("param", (value: ValidationFunction<string, string>, c: Context) => {
        const parsed = zIDparam.safeParse(value);
        if (!parsed.success) {
            return c.json({ message: "Not a valid Role ID!" }, 400);
        }
        return parsed.data;
    });
}

export {
    DepartmentIDValidator,
    DepartmentObjectValidator,
    RoleIDValidator,
    TicketEventValidator,
    TicketIDValidator,
    UserIDValidator,
};
