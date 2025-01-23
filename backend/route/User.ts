import { Hono } from "hono";
import { validator } from "hono/validator";
import { AlgorithmName, verify as crypto_verify } from "jsr:@stdext/crypto/hash";
import {
    AuthPrep,
    createJWTAuthToken,
    createJWTRefreshToken,
    JWTAuthController,
    removeJWTTokens,
} from "@backend/controller/AuthenticationController.ts";
import {
    DepartmentIDValidator,
    UserIDValidator,
} from "@backend/controller/ValidationController.ts";
import * as dbConroller from "@backend/service/dbController.ts";
import {
    S_User,
    S_UserAdmin,
    S_UserCreate,
    S_UserLogin,
    S_UserPreview,
} from "@shared/shared_schemas.ts";

const user = new Hono();
const ADMIN_USER_ID = Deno.env.get("ADMIN_USER_ID")!;

user.post(
    "/login",
    validator("json", (value, c) => {
        const parsed = S_UserLogin.safeParse(value);
        if (!parsed.success) {
            console.error(parsed.error);
            return c.json({ message: "Not a valid Object" }, 400);
        }
        return parsed.data;
    }),
    async (c) => {
        const login_user = c.req.valid("json");
        const user = await dbConroller.getUser({ user_name: login_user.user_name });
        if (!user) {
            return c.json({ error: "Invalid Credentials" }, 401);
        }
        // const user = S_ServersideUser.safeParse(user.toJSON());
        if (
            !crypto_verify(AlgorithmName.Argon2, login_user.password, user.password!)
        ) {
            return c.json({ error: "Invalid Credentials" }, 401);
        }
        // TODO create token uuid, by saving to DB -> create token only with token uuid
        await removeJWTTokens(c);
        await createJWTAuthToken(c, { user_id: user.user_id });
        await createJWTRefreshToken(c, { user_id: user.user_id });
        return c.json(S_User.parse(user), 200);
    },
);

user.post("/logout", JWTAuthController, (c) => {
    // console.log(
    // 	"logout initiated with access token: \n" + c.req.header("Authorization"),
    // );
    removeJWTTokens(c);
    // TODO delete token from DB
    return c.json({ message: "User logged out successfully" }, 200);
});

// get data of user itself
user.get("/", JWTAuthController, async (c) => {
    const server_user = await dbConroller.getUser({ user_id: c.var.user_id });
    if (!server_user) {
        return c.json({ error: "Invalid Credentials" }, 401);
    }
    // const server_user = S_ServersideUser.safeParse(user.toJSON());
    // if (!server_user.success) {
    //     return c.json({ message: "Serverside error" }, 500);
    // }
    const user = S_User.parse(server_user);

    return c.json(user, 200);
});

// get data of specified user
user.get("/:user_id", JWTAuthController, UserIDValidator(), AuthPrep, async (c) => {
    const server_user = await dbConroller.getUser({ user_id: c.req.valid("param") });
    if (!server_user) {
        return c.json({ error: "User not found" }, 400);
    }
    // const server_user = S_ServersideUser.safeParse(user_model.toJSON());
    // if (!server_user.success) {
    //     return c.json({ message: "Serverside error" }, 500);
    // }
    const user = S_User.parse(server_user);
    return c.json(user, 200);
});

// create
user.post(
    "/",
    JWTAuthController,
    // failure potential as it checks for parameter
    // UserValidator([Actions.user_create], [Actions.user_ownDeartment_create]),
    validator("json", (value, c) => {
        const parsed = S_UserCreate.safeParse(value);
        if (!parsed.success) {
            console.error(parsed.error);
            return c.json({ message: "Not a valid Object" }, 400);
        }
        return parsed.data;
    }),
    async (c) => {
        const user_create_success = await dbConroller.addUser(c.req.valid("json"));

        if (!user_create_success) {
            return c.json({ message: "User creation failed" }, 500);
        }
        return c.json({ message: "Successfully created User" }, 200);
    },
);
// modify
user.put(
    "/:user_id",
    JWTAuthController,
    // UserValidator([Actions.user_modify], [Actions.user_ownDeartment_modify]),
    UserIDValidator(),
    AuthPrep,
    validator("json", (value, c) => {
        const parsed = S_UserAdmin.safeParse(value);
        if (!parsed.success) {
            console.error(parsed.error);
            return c.json({ message: "Not a valid User Object" }, 400);
        }
        return parsed.data;
    }),
    async (c) => {
        if (c.req.valid("param") != c.req.valid("json").user_id) {
            return c.json({ message: "User ID of path and body does not match!" }, 400);
        }
        // deny update if last role of user would be deleted
        if (!c.req.valid("json").roles) {
            return c.json({ message: "User must have at least one Role!" }, 400);
        }
        // prevent admin role removal from admin user
        // if(c.req.valid("json").user_id === ADMIN_USER_ID){
        //     if(!c.req.valid("json").roles.some())
        // }
        // const user = await dbConroller.getUser({user_id:});

        const updated_user = await dbConroller.editUser(c.req.valid("json"));
        if (!updated_user) {
            return c.json({ message: "User modification failed" }, 500);
        }
        // const updated_user = S_ServersideUser.safeParse(updated_user.toJSON());
        // if (!updated_user.success) {
        //     console.error(updated_user.error);
        //     return c.json({ message: "Serverside error" }, 500);
        // }

        return c.json(updated_user, 200);
    },
);
// delete
user.delete(
    "/:user_id",
    JWTAuthController,
    // UserValidator([Actions.user_delete], [Actions.user_ownDeartment_delete]),
    UserIDValidator(),
    async (c) => {
        const user_id = c.req.valid("param");
        const user_delete_success = await dbConroller.deleteUser(user_id);
        if (!user_delete_success) {
            return c.json({ message: "User deletion failed" }, 500);
        }
        return c.json({ message: "Successfully deleted User" }, 200);
    },
);

// get all users of provided department
user.get(
    "/dept/:department_id",
    JWTAuthController,
    DepartmentIDValidator(),
    async (c) => {
        const users = await dbConroller.getAllUsersInDepartment(c.req.valid("param"));
        return c.json(users, 200);
    },
);

export default user;
