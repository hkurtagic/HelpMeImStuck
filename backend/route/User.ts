import { Hono } from "hono";
import { validator } from "hono/validator";
import { AlgorithmName, hash, verify as crypto_verify } from "jsr:@stdext/crypto/hash";
import {
	createJWTAuthToken,
	createJWTRefreshToken,
	JWTAuthController,
	removeJWTTokens,
} from "@backend/controller/AuthenticationController.ts";
import { UserValidator } from "@backend/controller/ValidationController.ts";
// import db from "@backend/service/database.ts";
import * as db2 from "@backend/service/dbController.ts";
import { Actions, UserCreate, UserLogin } from "@shared/shared_types.ts";
import { S_User, S_UserCreate, S_UserLogin } from "@shared/shared_schemas.ts";
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
		console.log(
			"login attempt with: " + login_user.user_name + "\nand pw: " + login_user.password,
		);
		const user = S_ServersideUser.safeParse(
			(await db2.getUser(undefined, login_user.user_name))?.toJSON(),
		);
		if (
			!user.success ||
			!crypto_verify(AlgorithmName.Argon2, login_user.password, user.data.password)
		) {
			return c.json({ error: "Invalid Credentials" }, 401);
		}
		await createJWTAuthToken(c, { user_id: user.data.user_id });
		await createJWTRefreshToken(c, { user_id: user.data.user_id });
		return c.json({ user_id: user.data.user_id, user_name: user.data.user_name }, 200);
	},
);

user.post("/logout", JWTAuthController, (c) => {
	console.log(
		"logout initiated with access token: \n" + c.req.header("Authorization"),
	);
	removeJWTTokens(c);
	return c.json({ message: "User logged out successfully" }, 200);
});

// get data of user itself
user.get("/", JWTAuthController, async (c) => {
	const user = await db2.getUser(c.var.user_id);
	if (!user) {
		return c.json({ error: "Invalid Credentials" }, 401);
	}
	return c.json({ user_id: user.pk_user_id, user_name: user.user_name }, 200);
});

// get all users of provided department
user.get("/department/:department_id", JWTAuthController, async (c) => {
	return c.json({ message: "" }, 200);
});

// create
user.post(
	"/",
	JWTAuthController,
	// failure potential as it checks for parameter
	UserValidator([Actions.user_create], [Actions.user_ownDeartment_create]),
	validator("json", (value, c) => {
		const parsed = S_UserCreate.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Object" }, 400);
		}
		return parsed.data;
	}),
	(c) => {
		const newUser = c.req.valid("json");
		// db2.addUser(			{ user_name: newUser.user_name, password_hash: newUser.password },
		// 	newUser.roles,
		// );

		// const user_id = db.addUser(
		// 	newUser.user_name,
		// 	hash(
		// 		AlgorithmName.Argon2,
		// 		newUser.password,
		// 	),
		// );
		if (user_id instanceof Error) {
			console.log(user_id);
			return c.json({ message: "Serverside error" }, 500);
		}
		newUser.roles.forEach((role) => {
			db.addUserToDepartment(user_id, role.department.department_id, role.role_id);
		});
		return c.json({ message: "Successfully created User" }, 200);
	},
);
// modify
user.put(
	"/:user_id",
	JWTAuthController,
	UserValidator([Actions.user_modify], [Actions.user_ownDeartment_modify]),
	validator("json", (value, c) => {
		const parsed = S_User.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Object" }, 400);
		}
		return parsed.data;
	}),
	(c) => {
		// const user = c.req.valid("json") as User;
		// if (user_id instanceof Error) {
		// 	console.log(user_id);
		// 	return c.json({ message: "Serverside error" }, 500);
		// }
		// user.roles.forEach((role) => {
		// 	db.addUserToDepartment(user_id, role.department.department_id, role.role_id);
		// });
		return c.json({ message: "Successfully modified User" }, 200);
	},
);
// delete
user.delete(
	"/:user_id",
	JWTAuthController,
	UserValidator([Actions.user_delete], [Actions.user_ownDeartment_delete]),
	(c) => {
		const user_id = c.req.valid("param");
		db.deleteUserById(user_id);

		return c.json({ message: "Successfully deleted User" }, 200);
	},
);

export default user;
