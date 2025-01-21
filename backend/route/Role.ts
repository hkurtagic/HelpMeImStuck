import { Hono } from "hono";
import { validator } from "hono/validator";
import { JWTAuthController } from "@backend/controller/AuthenticationController.ts";
import * as db2 from "@backend/service/dbController.ts";
import {
	DepartmentIDValidator,
	RoleIDValidator,
} from "@backend/controller/ValidationController.ts";
import { S_ServersideUser } from "@backend/schemes_and_types/serverside_schemas.ts";
import { S_Role, S_RoleCreate } from "@shared/shared_schemas.ts";

const role = new Hono();

// get all roles in department
role.get(
	"/dept/:department_id",
	JWTAuthController,
	DepartmentIDValidator(),
	async (c) => {
		const roles = await db2.getAllRolesInDepartment(c.req.valid("param"));
		return c.json(roles, 200);
	},
);

// get all roles of acting user
role.get("/own", JWTAuthController, async (c) => {
	const u = await db2.getUser({ user_id: c.var.user_id });
	if (!u) {
		return c.redirect("/user/logout");
	}
	const u_parsed = S_ServersideUser.safeParse(u.toJSON());
	if (!u_parsed.success) {
		console.error(u_parsed.error);
		return c.json({ message: "Serverside error" }, 500);
	}
	const roles = u_parsed.data.roles.map((r) => {
		const new_r = S_Role.parse(r);
		// r.actions = [];
		return new_r;
	});

	return c.json(roles, 200);
});

// create new role
role.post(
	"/",
	JWTAuthController,
	validator("json", (value, c) => {
		const parsed = S_RoleCreate.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Role Object" }, 400);
		}
		return parsed.data;
	}),
	async (c) => {
		const role_create_success = await db2.addRole(c.req.valid("json"));
		if (!role_create_success) {
			return c.json({ message: "Role creation failed" }, 500);
		}
		return c.json({ message: "Successfully created Role" }, 200);
	},
);

// modify
role.put(
	"/:role_id",
	JWTAuthController,
	RoleIDValidator(),
	validator("json", (value, c) => {
		const parsed = S_Role.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Role Object" }, 400);
		}
		return parsed.data;
	}),
	async (c) => {
		if (c.req.valid("param") != c.req.valid("json").role_id) {
			return c.json({ message: "Role ID of path and body does not match!" }, 400);
		}
		const updated_role_model = await db2.editRole(c.req.valid("json"));

		if (!updated_role_model) {
			return c.json({ message: "Role modification failed" }, 500);
		}
		const updated_role = S_Role.safeParse(updated_role_model.toJSON());
		if (!updated_role.success) {
			console.error(updated_role.error);
			return c.json({ message: "Serverside error" }, 500);
		}

		return c.json(updated_role.data, 200);
	},
);
// delete
role.delete(
	"/:role_id",
	JWTAuthController,
	RoleIDValidator(),
	async (c) => {
		const role_delete_success = await db2.deleteRole(c.req.valid("param"));
		if (!role_delete_success) {
			return c.json({ message: "Role deletion failed" }, 500);
		}
		return c.json({ message: "Successfully deleted Role" }, 200);
	},
);

export default role;
