import { Context } from "hono";
import { ValidationFunction, validator } from "hono/validator";
// import db from "@backend/service/database.ts";
import { Actions } from "@shared/shared_types.ts";
import * as db2 from "@backend/service/dbController.ts";
import { S_Department, S_Ticket, zIDparam, zUUIDparam } from "@shared/shared_schemas.ts";

function UserValidator(
	all_actions_needed: Actions[],
	ownDepartment_actions_needed: Actions[],
) {
	return validator("param", async (value: ValidationFunction<string, string>, c: Context) => {
		const user_id = zUUIDparam.safeParse(value);
		if (!user_id.success) {
			return c.json({ message: "Not a valid User ID" }, 400);
		}
		const user_model = await db2.getUser({ user_id: user_id.data });
		if (!user_model) {
			return c.json({ message: "User does not exist" }, 400);
		}
		const user = user_model.toJSON();
		const acting_user_model = await db2.getUser({ user_id: c.var.user_id });
		if (!acting_user_model) {
			return c.json({ message: "Serverside Error" }, 500);
		}
		const acting_user = acting_user_model.toJSON();
		const all_actions_set = new Set(all_actions_needed);
		const user_actions_set = new Set(acting_user.actions);
		if (all_actions_set.intersection(user_actions_set).size) {
			// return user_id if user has permissions
			return user_id.data;
		}
		// check if acting user and user to be accessed have a shared department
		const acting_user_depts = new Set(acting_user.roles.map((r) => r.department.department_id));
		const user_depts = new Set(user.roles.map((r) => r.department.department_id));
		const shared_departments = Array.from(acting_user_depts.intersection(user_depts));
		if (!shared_departments.length) {
			return c.json({ message: "Permission denied" }, 403);
		}
		const acting_user_shared_dept_role_actions = acting_user.roles.map((r) => {
			if (shared_departments.includes(r.department.department_id)) {
				return r.actions;
			}
		}).flat();

		const ownDept_actions_set = new Set(all_actions_needed);
		const shared_dept_role_actions_set = new Set(acting_user_shared_dept_role_actions);
		if (!shared_dept_role_actions_set.intersection(ownDept_actions_set).size) {
			return c.json({ message: "Permission denied" }, 403);
		}
		// missing department specific restriction
		return user_id.data;
	});
}

function TicketIDValidator() {
	return validator("param", (value: ValidationFunction<string, string>, c: Context) => {
		const ticket_id = zUUIDparam.safeParse(value);
		if (ticket_id.success) {
			return ticket_id.data;
		}
		return c.json({ message: "Not a valid Ticket ID!" }, 400);
	});
}
function TicketValidator() {
	return validator("json", (value: ValidationFunction<string, string>, c: Context) => {
		const parsed = S_Ticket.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Ticket object!" }, 400);
		}
		return parsed.data;
	});
}
function DepartmentIDValidator() {
	return validator("param", (value: ValidationFunction<string, string>, c: Context) => {
		const ticket_id = zIDparam.safeParse(value);
		if (ticket_id.success) {
			return ticket_id.data;
		}
		return c.json({ message: "Not a valid Department ID!" }, 400);
	});
}
function DepartmentValidator() {
	return validator("json", (value: ValidationFunction<string, string>, c: Context) => {
		const parsed = S_Department.safeParse(value);
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
