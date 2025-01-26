import { Hono } from "hono";
import { validator } from "hono/validator";
import {
    AuthPrep,
    departmentEndpoindAuth,
    JWTAuthController,
} from "@backend/controller/AuthenticationController.ts";
import * as dbController from "@backend/service/dbController.ts";
import {
    DepartmentIDValidator,
    DepartmentObjectValidator,
} from "@backend/controller/ValidationController.ts";

import { S_Department, S_DepartmentCreate } from "@shared/shared_schemas.ts";

const department = new Hono();

// get all departments
department.get("/", JWTAuthController, async (c) => {
    const depts = await dbController.getAllDepartments();
    return c.json(depts, 200);
});
// create a new department
department.post(
    "/",
    JWTAuthController,
    AuthPrep,
    departmentEndpoindAuth,
    validator("json", (value, c) => {
        const parsed = S_DepartmentCreate.safeParse(value);
        if (!parsed.success) {
            console.error(parsed.error);
            return c.json({ message: "Not a valid Object" }, 400);
        }
        return parsed.data;
    }),
    async (c) => {
        const dept = await dbController.addDepartment(c.req.valid("json"));
        return c.json(dept, 200);
    },
);
// update
department.put(
    "/:department_id",
    JWTAuthController,
    AuthPrep,
    departmentEndpoindAuth,
    DepartmentIDValidator(),
    DepartmentObjectValidator(),
    async (c) => {
        if (c.req.valid("param") != c.req.valid("json").department_id) {
            return c.json({ message: "Department ID of path and body does not match!" }, 400);
        }
        const updated_dept_model = await dbController.editDepartment(c.req.valid("json"));
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
    AuthPrep,
    departmentEndpoindAuth,
    DepartmentIDValidator(),
    async (c) => {
        const dept_delete_success = await dbController.deleteDepartment(c.req.valid("param"));
        if (!dept_delete_success) {
            return c.json({ message: "Department deletion failed" }, 500);
        }
        return c.json({ message: "Successfully deleted Department" }, 200);
    },
);

export default department;
