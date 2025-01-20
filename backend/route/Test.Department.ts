import { Hono } from "hono";
import { validator } from "hono/validator";
import { JWTAuthController } from "../controller/Test.AuthenticationController.ts";
import { Department, NewDepartment } from "@shared/shared_types.ts";
import db from "@backend/service/database.ts";
import { DepartmentScheme, ID, NewDepartmentScheme } from "@shared/shared_schemas.ts";

import { getTestData, setTestData } from "../../tests/backend/sync.ts";

const department = new Hono();
const testData = getTestData();

// get all departments
department.get("/", JWTAuthController, (c) => {
	return c.json(testData.departments, 200);
});
// get all departments of acting user
department.get("/own", JWTAuthController, (c) => {
	const u = testData.users.find((u) => u.user_id === c.var.user_id);
	if (!u) {
		return c.json({ message: "User not found" }, 400);
	}
	const depts = testData.departments.filter((d) => u.roles.filter((r) => r.department === d));
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
		return parsed.data as NewDepartment;
	}),
	(c) => {
		const new_dept = c.req.valid("json") as NewDepartment;
		testData.departments.push(
			{
				department_id: testData.departments.length,
				department_name: new_dept.department_name,
				department_description: new_dept.department_description,
			},
		);
		setTestData(testData);
		return c.json({ message: "Successfully created Department" }, 200);
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
		const dept = await c.req.valid("json");
		if (parseInt(c.req.param().department_id) != dept.department_id) {
			return c.json({ message: "Department ID of path and body does not match!" }, 400);
		}
		// const depts = db.updateDepartment(req);
		// if (depts instanceof Error) {
		// 	console.log(depts);
		// 	return c.json({ message: "Serverside error" }, 500);
		// }
		// return c.json(depts, 200);
		const index = testData.departments.findIndex((d) => d.department_id === dept.department_id);
		if (index < 1) {
			console.log(dept.department_id);
			return c.json({ message: "Department not found" }, 500);
		}

		testData.departments[index] = { ...testData.departments[index], ...dept };
		setTestData(testData);

		return c.json({ message: "Successfully modified Department" }, 200);
	},
);
// delete
department.delete(
	"/:department_id",
	JWTAuthController,
	validator("param", (value, c) => {
		const parsed = ID.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Department ID" }, 400);
		}
		return parsed.data;
	}),
	(c) => {
		const dept_id = c.req.valid("param");
		const index = testData.departments.findIndex((d) => d.department_id === dept_id);
		if (index < 1) {
			console.log(dept_id);
			return c.json({ message: "Department does not exist" }, 400);
		}
		testData.departments.splice(
			testData.departments.findIndex((d) => d.department_id === dept_id),
		);
		setTestData(testData);

		return c.json({ message: "Successfully deleted Department" }, 200);
	},
);

export default department;
