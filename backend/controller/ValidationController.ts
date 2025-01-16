import { Context } from "hono";
import { ValidationFunction, validator } from "hono/validator";
import db from "@backend/service/database.ts";
import { Actions } from "@shared/shared_types.ts";
import { DepartmentScheme, ID, TicketScheme, UUID } from "@shared/shared_schemas.ts";

function UserValidator(
	allowed_actions: Actions[],
	allowed_ownDepartment_actions: Actions[],
) {
	return validator("param", (value: ValidationFunction<string, string>, c: Context) => {
		const user_id = UUID.safeParse(value);
		if (user_id.success) {
			if (user_id.data === c.var.user_id) {
				return user_id.data;
			}
			const user = db.getUserById(user_id.data);
			if (user !== undefined) {
				const acting_user_actions = db.getUserActionsByUserId(c.var.user_id);
				const acting_user_depts = db.getDepartmentsOfUser(c.var.user_id);
				const user_depts = db.getDepartmentsOfUser(user_id.data);
				if (
					acting_user_actions instanceof Error || acting_user_depts instanceof Error ||
					user_depts instanceof Error
				) {
					console.log(acting_user_actions);
					console.log(acting_user_depts);
					console.log(user_depts);
					return c.json({ message: "Serverside error" }, 500);
				}
				if (
					acting_user_actions.map((a) => a.actions).filter((value) =>
							allowed_actions.includes(value)
						).length > 0 ||
					(acting_user_actions.map((a) => a.actions).filter((value) =>
								allowed_ownDepartment_actions.includes(value)
							).length > 0 &&
						acting_user_depts.map((d) => d.department_id).filter((value) =>
							user_depts.map((d) => d.department_id).includes(value)
						))
				) {
					return user_id.data;
				}
			}
		}
		return c.json({ message: "Not a valid User ID!" }, 400);
	});
}
function TicketIDValidator() {
	return validator("param", (value: ValidationFunction<string, string>, c: Context) => {
		const ticket_id = UUID.safeParse(value);
		if (ticket_id.success) {
			return ticket_id.data;
		}
		return c.json({ message: "Not a valid Ticket ID!" }, 400);
	});
}
function TicketValidator() {
	return validator("json", (value: ValidationFunction<string, string>, c: Context) => {
		const parsed = TicketScheme.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Ticket object!" }, 400);
		}
		return parsed.data;
	});
}
function DepartmentIDValidator() {
	return validator("param", (value: ValidationFunction<string, string>, c: Context) => {
		const ticket_id = ID.safeParse(value);
		if (ticket_id.success) {
			return ticket_id.data;
		}
		return c.json({ message: "Not a valid Department ID!" }, 400);
	});
}
function DepartmentValidator() {
	return validator("json", (value: ValidationFunction<string, string>, c: Context) => {
		const parsed = DepartmentScheme.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Department object!" }, 400);
		}
		return parsed.data;
	});
}
export {
	DepartmentIDValidator,
	DepartmentValidator,
	TicketIDValidator,
	TicketValidator,
	UserValidator,
};
