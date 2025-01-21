import { Hono } from "hono";
import { validator } from "hono/validator";
import { JWTAuthController } from "@backend/controller/AuthenticationController.ts";
import * as db2 from "@backend/service/dbController.ts";
import {
	DepartmentIDValidator,
	DepartmentObjectValidator,
} from "@backend/controller/ValidationController.ts";

import { S_Department, S_DepartmentCreate } from "@shared/shared_schemas.ts";

const department = new Hono();

// get all departments
department.get("/", JWTAuthController, (c) => {
	const depts = db2.getAllDepartments();
	return c.json(depts, 200);
});
// // get all departments of acting user
// department.get("/own", JWTAuthController, async (c) => {
// 	const user = await db2.getUser({user_id: c.var.user_id})
// 	if (!user) {
// 		return c.redirect("/user/logout");
// 	}
//     const u_parsed = S_ServersideUser.safeParse(user.toJSON());
//     if (!u_parsed.success) {
// 		console.error(u_parsed.error);
// 		return c.json({ message: "Serverside error" }, 500);
// 	}
// 	const own_dept_ids = u_parsed.data.roles.map((r) => {
// 		return r.department.department_id;
// 	});

// 	return c.json(own_dept_ids, 200);
// });
// create a new department
department.post(
	"/",
	JWTAuthController,
	validator("json", (value, c) => {
		const parsed = S_DepartmentCreate.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Object" }, 400);
		}
		return parsed.data;
	}),
	async (c) => {
		const dept = await db2.addDepartment(c.req.valid("json"));
		return c.json(dept, 200);
	},
);
// update
department.put(
	"/:department_id",
	JWTAuthController,
	DepartmentIDValidator(),
	DepartmentObjectValidator(),
	async (c) => {
		if (c.req.valid("param") != c.req.valid("json").department_id) {
			return c.json({ message: "Department ID of path and body does not match!" }, 400);
		}
		const updated_dept_model = await db2.editDepartment(c.req.valid("json"));
		if (!updated_dept_model) {
			return c.json({ message: "Department modification failed" }, 500);
		}
		const updated_dept = S_Department.safeParse(updated_dept_model.toJSON());
		if (!updated_dept.success) {
			console.error(updated_dept.error);
			return c.json({ message: "Serverside error" }, 500);
		}

		return c.json(updated_dept.data, 200);
	},
);
// delete
department.delete(
	"/:department_id",
	JWTAuthController,
	DepartmentIDValidator(),
	async (c) => {
		const dept_delete_success = await db2.deleteDepartment(c.req.valid("param"));
		if (!dept_delete_success) {
			return c.json({ message: "Department deletion failed" }, 500);
		}
		return c.json({ message: "Successfully deleted Department" }, 200);
	},
);

export default department;
