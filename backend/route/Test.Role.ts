import { Hono } from "hono";
import { validator } from "hono/validator";
import {
	createJWTAuthToken,
	createJWTRefreshToken,
	JWTAuthController,
	removeJWTTokens,
} from "@backend/controller/Test.AuthenticationController.ts";
import { Actions, Department, LoginUser, NewRole, NewUser, User } from "@shared/shared_types.ts";
import { ID, NewRoleScheme, RoleScheme, zIDparam } from "@shared/shared_schemas.ts";
import { getTestData, setTestData } from "../../tests/backend/sync.ts";
// import {
// 	DepartmentScheme,
// 	TestDepartmentScheme,
// 	TestUserScheme,
// } from "../../shared/shared_schemas.ts";
import { Role } from "../../shared/shared_types.ts";

const role = new Hono();
const testData = getTestData();

// get all roles in department
role.get(
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
		const roles = testData.roles.filter((r) =>
			r.department.department_id === c.req.valid("param")
		);
		if (!roles) {
			console.log(c.req.valid("param"));
			return c.json({ error: "No Roles in Department" }, 500);
		}
		return c.json(roles, 200);
	},
);

// get all roles of acting user
role.get("/own", JWTAuthController, (c) => {
	const u = testData.users.find((u) => u.user_id === c.var.user_id);
	if (!u) {
		return c.json({ message: "User not found" }, 400);
	}
	const roles = testData.roles.filter((r) => u.roles.filter((ur) => ur.role_id === r.role_id));
	return c.json(roles, 200);
});

// create new role
role.post(
	"/",
	JWTAuthController,
	validator("json", (value, c) => {
		const parsed = NewRoleScheme.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Role Object" }, 400);
		}
		return parsed.data as NewRole;
	}),
	(c) => {
		const new_role = c.req.valid("json") as NewRole;
		testData.roles.push(
			{
				role_id: testData.roles.length,
				...new_role,
			},
		);
		setTestData(testData);
		return c.json({ message: "Successfully created Department" }, 200);
	},
);

// modify
role.put(
	"/:role_id",
	JWTAuthController,
	validator("json", (value, c) => {
		const parsed = RoleScheme.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Role Object" }, 400);
		}
		return parsed.data;
	}),
	(c) => {
		const role_to_update = c.req.valid("json") as Role;
		const index = testData.roles.findIndex((r) => r.role_id === role_to_update.role_id);
		if (index < 1) {
			console.log(role_to_update.role_id);
			return c.json({ message: "Serverside error" }, 500);
		}

		testData.roles[index] = { ...testData.roles[index], ...role_to_update };
		setTestData(testData);

		return c.json({ message: "Successfully modified Role" }, 200);
	},
);
// delete
role.delete(
	"/:role_id",
	JWTAuthController,
	validator("param", (value, c) => {
		const parsed = zIDparam.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Role ID" }, 400);
		}
		return parsed.data;
	}),
	(c) => {
		const role_id = c.req.valid("param");
		testData.roles.splice(testData.roles.findIndex((r) => r.role_id === role_id));
		setTestData(testData);
		return c.json({ message: "Successfully deleted Role" }, 200);
	},
);

export default role;
