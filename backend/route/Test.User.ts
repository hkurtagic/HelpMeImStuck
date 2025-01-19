import { Hono } from "hono";
import { validator } from "hono/validator";
import {
	createJWTAuthToken,
	createJWTRefreshToken,
	JWTAuthController,
	removeJWTTokens,
} from "@backend/controller/Test.AuthenticationController.ts";
import { Actions, Department, LoginUser, NewUser, User } from "@shared/shared_types.ts";
import { NewUserScheme, UserScheme } from "@shared/shared_schemas.ts";
import { getTestData, setTestData } from "../../tests/backend/sync.ts";
import {
	DepartmentScheme,
	TestDepartmentScheme,
	TestUserScheme,
} from "../../shared/shared_schemas.ts";
import { Role } from "../../shared/shared_types.ts";

const user = new Hono();
const testData = getTestData();

user.post("/login", async (c) => {
	const { user_name, password } = (await c.req.json()) as LoginUser;
	console.log("login attempt with: " + user_name + "\nand pw: " + password);
	const user = testData.users.filter((u) => u.user_name === user_name)[0];
	console.log("dbUser: " + user);
	if (
		!user
	) {
		return c.json({ error: "Invalid Credentials" }, 401);
	}
	await createJWTAuthToken(c, { user_id: user.user_id });
	await createJWTRefreshToken(c, { user_id: user.user_id });
	return c.json({ user_id: user.user_id, user_name: user.user_name }, 200);
});
// get data of user itself
user.get("/", JWTAuthController, (c) => {
	const user = testData.users.filter((u) => u.user_id === c.var.user_id)[0];
	if (!user) {
		console.log(user);
		return c.json({ error: "Server error" }, 500);
	}
	return c.json({ user_id: user.user_id, user_name: user.user_name }, 200);
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
	validator("json", (value, c) => {
		const parsed = NewUserScheme.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Object" }, 400);
		}
		return parsed.data;
	}),
	(c) => {
		const newUser = c.req.valid("json") as NewUser;
		const user_id = testData.users.push(
			{
				user_id: (testData.users.length++).toString(),
				user_name: newUser.user_name,
				roles: newUser.roles,
			},
		);
		setTestData(testData);
		return c.json({ message: "Successfully created User" }, 200);
	},
);
// modify
user.put(
	"/:user_id",
	JWTAuthController,
	validator("json", (value, c) => {
		const parsed = TestUserScheme.safeParse(value);
		if (!parsed.success) {
			return c.json({ message: "Not a valid Object" }, 400);
		}
		return parsed.data;
	}),
	(c) => {
		const user = c.req.valid("json") as User;
		// if (user_id instanceof Error) {
		// 	console.log(user_id);
		// 	return c.json({ message: "Serverside error" }, 500);
		// }
		// user.roles.forEach((role) => {
		// 	db.addUserToDepartment(user_id, role.department.department_id, role.role_id);
		// });
		const index = testData.users.findIndex((u) => u.user_id === user.user_id);
		if (index < 1) {
			console.log(user.user_id);
			return c.json({ message: "Serverside error" }, 500);
		}

		testData.users[index] = { ...testData.users[index], ...user };
		setTestData(testData);

		return c.json({ message: "Successfully modified User" }, 200);
	},
);
// delete
user.delete(
	"/:user_id",
	JWTAuthController,
	(c) => {
		const user_id = c.req.param("user_id");
		testData.users.splice(testData.users.findIndex((u) => u.user_id === user_id));
		setTestData(testData);
		return c.json({ message: "Successfully deleted User" }, 200);
	},
);
// get all users from dep
user.get(
	"/dept/:department_id",
	JWTAuthController,
	(c) => {
		const department_id = Number(c.req.param("department_id"));
		const users = testData.users.map((u) => u.roles.map((r) => r.department.department_id));
		const index = users.map((u) => u.includes(department_id));
		let res: User[] = [];

		for (let i = 0; i < index.length; i++) {
			if (index[i]) res.push(testData.users.at(i)!);
		}

		/*if (!roles) {
			console.log(department_id);
			return c.json({ message: "Serverside error" }, 500);
		}*/

		// if (user_id instanceof Error) {
		// 	console.log(user_id);
		// 	return c.json({ message: "Serverside error" }, 500);
		// }
		// user.roles.forEach((role) => {
		// 	db.addUserToDepartment(user_id, role.department.department_id, role.role_id);
		// });
		return c.json({ ...res }, 200);
	},
);

export default user;
