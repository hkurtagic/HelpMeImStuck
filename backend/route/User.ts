import { Hono } from "hono";
import { validator } from "hono/validator";
import { AlgorithmName, verify as crypto_verify } from "jsr:@stdext/crypto/hash";
import {
	createJWTAuthToken,
	createJWTRefreshToken,
	JWTAuthController,
	removeJWTTokens,
} from "@backend/controller/AuthenticationController.ts";
import {
	DepartmentIDValidator,
	UserIDValidator,
} from "@backend/controller/ValidationController.ts";
import * as db2 from "@backend/service/dbController.ts";
import { S_User, S_UserAdmin, S_UserCreate, S_UserLogin } from "@shared/shared_schemas.ts";
import { S_ServersideUser } from "@backend/schemes_and_types/serverside_schemas.ts";

const user = new Hono();

user.post(
	"/login",
	validator("json", (value, c) => {
		const parsed = S_UserLogin.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Object" }, 400);
		}
		return parsed.data;
	}),
	async (c) => {
		const login_user = c.req.valid("json");
		const user = S_ServersideUser.safeParse(
			(await db2.getUser({ user_name: login_user.user_name }))?.toJSON(),
		);
		if (
			!user.success ||
			!crypto_verify(AlgorithmName.Argon2, login_user.password, user.data.password)
		) {
			return c.json({ error: "Invalid Credentials" }, 401);
		}
		// TODO create token uuid, by saving to DB -> create token only with token uuid
		await createJWTAuthToken(c, { user_id: user.data.user_id });
		await createJWTRefreshToken(c, { user_id: user.data.user_id });
		return c.json({ user_id: user.data.user_id, user_name: user.data.user_name }, 200);
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
	const user_model = await db2.getUser({ user_id: c.var.user_id });
	if (!user_model) {
		return c.json({ error: "Invalid Credentials" }, 401);
	}
	const user = S_ServersideUser.safeParse(user_model.toJSON());
	if (!user.success) {
		return c.json({ message: "Serverside error" }, 500);
	}
	return c.json({ user_id: user.data.user_id, user_name: user.data.user_name }, 200);
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
			return c.json({ message: "Not a valid Object" }, 400);
		}
		return parsed.data;
	}),
	async (c) => {
		const user_create_success = await db2.addUser(c.req.valid("json"));

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
	validator("json", (value, c) => {
		const parsed = S_UserAdmin.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid User Object" }, 400);
		}
		return parsed.data;
	}),
	async (c) => {
		if (c.req.valid("param") != c.req.valid("json").user_id) {
			return c.json({ message: "User ID of path and body does not match!" }, 400);
		}
		const updated_user_model = await db2.editUser(c.req.valid("json"));
		if (!updated_user_model) {
			return c.json({ message: "User modification failed" }, 500);
		}
		const updated_user = S_User.safeParse(updated_user_model.toJSON());
		if (!updated_user.success) {
			console.error(updated_user.error);
			return c.json({ message: "Serverside error" }, 500);
		}

		return c.json(updated_user.data, 200);
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
		const user_delete_success = await db2.deleteUser(user_id);
		if (!user_delete_success) {
			return c.json({ message: "User deletion failed" }, 500);
		}
		return c.json({ message: "Successfully deleted User" }, 200);
	},
);

// get all users of provided department
user.get(
	"/department/:department_id",
	JWTAuthController,
	DepartmentIDValidator(),
	async (c) => {
		const users = await db2.getAllUsersInDepartment(c.req.valid("param"));
		return c.json(users, 200);
	},
);

export default user;
