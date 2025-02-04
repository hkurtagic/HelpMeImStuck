import { Hono } from "hono";
import { validator } from "hono/validator";
import {
    AuthPrep,
    JWTAuthController,
    roleEndpoindAuth,
} from "@backend/controller/AuthenticationController.ts";
import * as dbController from "@backend/service/dbController.ts";
import {
    DepartmentIDValidator,
    RoleIDValidator,
} from "@backend/controller/ValidationController.ts";
import { S_Role, S_RoleCreate } from "@shared/shared_schemas.ts";

const role = new Hono();

// get all roles in department
role.get(
    "/dept/:department_id",
    JWTAuthController,
    AuthPrep,
    roleEndpoindAuth,
    DepartmentIDValidator(),
    async (c) => {
        const roles = await dbController.getAllRolesInDepartment(c.req.valid("param"));
        return c.json(roles, 200);
    },
);

// get all roles of acting user
role.get("/", JWTAuthController, async (c) => {
    const user = await dbController.getUser({ user_id: c.var.user_id });
    if (!user) {
        return c.redirect("/user/logout");
    }
    const roles = user.roles.map((r) => {
        const new_r = S_Role.parse(r);
        return new_r;
    });

    return c.json(roles, 200);
});

// create new role
role.post(
    "/",
    JWTAuthController,
    AuthPrep,
    roleEndpoindAuth,
    validator("json", (value, c) => {
        const parsed = S_RoleCreate.safeParse(value);
        if (!parsed.success) {
            console.error(parsed.error);
            return c.json({ message: "Not a valid Role Object" }, 400);
        }
        return parsed.data;
    }),
    async (c) => {
        const role_create_success = await dbController.addRole(c.req.valid("json"));
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
    AuthPrep,
    roleEndpoindAuth,
    RoleIDValidator(),
    validator("json", (value, c) => {
        const parsed = S_Role.safeParse(value);
        if (!parsed.success) {
            console.error(parsed.error);
            return c.json({ message: "Not a valid Role Object" }, 400);
        }
        return parsed.data;
    }),
    async (c) => {
        if (c.req.valid("param") != c.req.valid("json").role_id) {
            return c.json({ message: "Role ID of path and body does not match!" }, 400);
        }
        const updated_role_model = await dbController.editRole(c.req.valid("json"));

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
    AuthPrep,
    roleEndpoindAuth,
    RoleIDValidator(),
    async (c) => {
        const role_delete_success = await dbController.deleteRole(c.req.valid("param"));
        if (!role_delete_success) {
            return c.json({ message: "Role deletion failed" }, 500);
        }
        return c.json({ message: "Successfully deleted Role" }, 200);
    },
);

export default role;
