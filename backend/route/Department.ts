import { Hono } from "hono";
import { ActionAuthPrep, JWTAuthController } from "../controller/AuthenticationController.ts";
import { Department, newDepartment } from "@shared/shared_types.ts";
import db from "@backend/service/database.ts";

const department = new Hono();

department.get("/", JWTAuthController, (c) => {
	const depts = db.getDepartments();
	if (!(depts instanceof Error)) {
		return c.json(depts, 200);
	}
	return c.json({ message: "Database error" }, 500);
});

department.get("/own", JWTAuthController, (c) => {
	// const req = await c.req.json() as ({ user_id: string });
	const depts = db.getDepartmentsOfUser(c.var.user_id);
	if (depts instanceof Error) {
		console.log(depts);
		return c.json({ message: "Serverside error" }, 500);
	}
	return c.json(depts, 200);
});
// create
department.post("/", JWTAuthController, ActionAuthPrep, async (c) => {
	const req = await c.req.json() as newDepartment;
	const depts = db.addDepartment(req.department_name, req.department_description);
	if (depts instanceof Error) {
		console.log(depts);
		return c.json({ message: "Serverside error" }, 500);
	}
	return c.json(depts, 200);
});
// update
department.put("/:department_id", JWTAuthController, ActionAuthPrep, async (c) => {
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
});
// delete
department.delete("/:department_id", JWTAuthController, ActionAuthPrep, (c) => {
	// const req = await c.req.json() as Department;
	const depts = db.deleteDepartment(parseInt(c.req.param().department_id));
	if (depts instanceof Error) {
		console.log(depts);
		return c.json({ message: "Serverside error" }, 500);
	}
	return c.json(depts, 200);
});

export default department;
