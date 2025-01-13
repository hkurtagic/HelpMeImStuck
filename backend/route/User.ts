import { Hono } from "hono";
import { validator } from "hono/validator";
import {
	createJWTAuthToken,
	createJWTRefreshToken,
	JWTAuthController,
	removeJWTTokens,
	UserValidator,
} from "@backend/controller/AuthenticationController.ts";
import { AlgorithmName, hash, verify as crypto_verify } from "jsr:@stdext/crypto/hash";
import db from "@backend/service/database.ts";
import { Actions, LoginUser, NewUser, User } from "@shared/shared_types.ts";
import { NewUserScheme, UserScheme } from "@shared/shared_schemas.ts";
import z from "zod";

const user = new Hono();

user.post("/login", async (c) => {
	const { user_name, password } = (await c.req.json()) as LoginUser;
	console.log("login attempt with: " + user_name + "\nand pw: " + password);
	const user = db.getUserByUsername(user_name);
	console.log("dbUser: " + user);
	if (user instanceof Error) {
		console.log(user);
		return c.json({ error: "Server error" }, 500);
	}
	if (
		user == undefined ||
		!crypto_verify(AlgorithmName.Argon2, password, user.password_hash)
	) {
		return c.json({ error: "Invalid Credentials" }, 401);
	}
	await createJWTAuthToken(c, { user_id: user.pk_user_id });
	await createJWTRefreshToken(c, { user_id: user.pk_user_id });
	return c.json({ user_id: user.pk_user_id, user_name: user.user_name }, 200);
});
// get data of user itself
user.get("/", JWTAuthController, (c) => {
	const user = db.getUserById(c.var.user_id)!;
	if (user instanceof Error) {
		console.log(user);
		return c.json({ error: "Server error" }, 500);
	}
	return c.json({ user_id: user.pk_user_id, user_name: user.user_name }, 200);
});

user.post("/logout", JWTAuthController, (c) => {
	console.log(
		"logout initiated with access token: \n" + c.req.header("Authorization"),
	);
	removeJWTTokens(c);
	return c.json({ message: "User logged out successfully" }, 200);
});

// create
user.post(
	"/",
	JWTAuthController,
	// failure potential as it checks for parameter
	UserValidator([Actions.user_create], [Actions.user_ownDeartment_create]),
	validator("json", (value, c) => {
		const parsed = NewUserScheme.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Object" }, 400);
		}
		return parsed.data;
	}),
	(c) => {
		const newUser = c.req.valid("json") as NewUser;
		const user_id = db.addUser(
			newUser.user_name,
			hash(
				AlgorithmName.Argon2,
				newUser.password,
			),
		);
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
		const parsed = UserScheme.safeParse(value);
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
