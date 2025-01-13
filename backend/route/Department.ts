import { Hono } from "hono";
import { validator } from "hono/validator";
import { JWTAuthController } from "../controller/AuthenticationController.ts";
import { Department, NewDepartment } from "@shared/shared_types.ts";
import db from "@backend/service/database.ts";
import { DepartmentScheme, IDScheme, NewDepartmentScheme } from "@shared/shared_schemas.ts";

const department = new Hono();

// get all departments
department.get("/", JWTAuthController, (c) => {
	const depts = db.getDepartments();
	if (!(depts instanceof Error)) {
		return c.json(depts, 200);
	}
	return c.json({ message: "Database error" }, 500);
});
// get all departments of acting user
department.get("/own", JWTAuthController, (c) => {
	// const req = await c.req.json() as ({ user_id: string });
	const depts = db.getDepartmentsOfUser(c.var.user_id);
	if (depts instanceof Error) {
		console.log(depts);
		return c.json({ message: "Serverside error" }, 500);
	}
	return c.json(depts, 200);
});
// create a new department
department.post(
	"/",
	JWTAuthController,
	validator("json", (value, c) => {
		const parsed = NewDepartmentScheme.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Object" }, 400);
		}
		return parsed.data;
	}),
	async (c) => {
		const req = await c.req.json() as NewDepartment;
		const depts = db.addDepartment(req.department_name, req.department_description);
		if (depts instanceof Error) {
			console.log(depts);
			return c.json({ message: "Serverside error" }, 500);
		}
		return c.json(depts, 200);
	},
);
// update
department.put(
	"/:department_id",
	JWTAuthController,
	validator("json", (value, c) => {
		const parsed = DepartmentScheme.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Object" }, 400);
		}
		return parsed.data;
	}),
	async (c) => {
		const req = await c.req.json() as Department;
		if (parseInt(c.req.param().department_id) != req.department_id) {
			return c.json({ message: "Department ID of path and body does not match!" }, 400);
		}
		const depts = db.updateDepartment(req);
		if (depts instanceof Error) {
			console.log(depts);
			return c.json({ message: "Serverside error" }, 500);
		}
		return c.json(depts, 200);
	},
);
// delete
department.delete("/:department_id", JWTAuthController, (c) => {
	const d_validation = IDScheme.safeParse(c.req.param());
	if (!d_validation.success) {
		return c.json({ message: "Not a valid Department ID" }, 400);
	}
	const dept = db.getDepartmentById(d_validation.data);
	if (dept instanceof Error) {
		console.log(dept);
		return c.json({ message: "Serverside error" }, 500);
	}
	if (dept === undefined) {
		return c.json({ message: "Department does not exist" }, 400);
	}
	const del_dept = db.deleteDepartment(parseInt(c.req.param().department_id));
	if (del_dept instanceof Error) {
		console.log(del_dept);
		return c.json({ message: "Serverside error" }, 500);
	}
	return c.json(del_dept, 200);
});

export default department;
