import { decode, sign, verify } from "hono/jwt";
import { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { Next } from "hono/types";
import { createMiddleware } from "hono/factory";
import { ValidationFunction, validator } from "hono/validator";
import { JWTExtraPayload, JWTPayload } from "@backend/model/serverside_types.ts";
import db from "@backend/service/database.ts";
import { Actions } from "@shared/shared_types.ts";
import { UUIDScheme } from "@shared/shared_schemas.ts";

const JWT_SECRET = Deno.env.get("JWT_SECRET")!;
const JWT_ACCESS_EXPIRY = parseInt(Deno.env.get("JWT_ACCESS_EXPIRY")!);
const JWT_REFRESH_SECRET = Deno.env.get("JWT_REFRESH_SECRET")!;
const JWT_REFRESH_EXPIRY = parseInt(Deno.env.get("JWT_REFRESH_EXPIRY")!);

const JWTAuthController = createMiddleware<{
	Variables: {
		user_id: string;
	};
}>(
	async (c: Context, next: Next) => {
		const accessToken = c.req.header("Authorization");
		const refreshToken = getCookie(c, "refreshToken");
		console.log(
			`JWT accessToken: ${accessToken}\nJWT refreshToken: ${refreshToken}`,
		);
		if (accessToken) {
			console.log(
				`decoded JWT accessToken: ${JSON.stringify(decode(accessToken!).payload)}`,
			);
		}
		if (refreshToken) {
			console.log(
				`decoded JWT refreshToken: ${JSON.stringify(decode(refreshToken!).payload)}`,
			);
		}
		if (!accessToken && !refreshToken) {
			return c.json({ message: "Unauthorized" }, 401);
		}
		let user_id = undefined;
		try {
			user_id = (await verifyJWTToken(accessToken, JWT_SECRET)).user_id;
		} catch (_error1) {
			if (!refreshToken) {
				return c.json({ message: "Unauthorized" }, 401);
			}
			try {
				user_id = (await verifyJWTToken(refreshToken, JWT_REFRESH_SECRET)).user_id;
				createJWTAuthToken(c, { user_id: user_id });
			} catch (_error2) {
				console.log("_error1\n");
				console.log(_error1);
				console.log("_error2\n");
				console.log(_error2);
				return c.json({ message: "Invalid Token." }, 400);
			}
		}
		const user = db.getUserById(user_id);
		if ((user == undefined)) {
			removeJWTTokens(c);
			return c.json({ message: "User does not exist" }, 401);
		}
		if ((user instanceof Error)) {
			console.log(user);
			return c.json({ message: "Serverside error" }, 500);
		}
		console.log("JWT user_id: " + user_id);
		c.set("user_id", user_id);
		await next();
	},
);
function UserValidator(
	allowed_actions: Actions[],
	allowed_ownDepartment_actions: Actions[],
) {
	return validator("param", (value: ValidationFunction<string, string>, c: Context) => {
		const user_id = UUIDScheme.safeParse(value);
		if (user_id.success) {
			if (user_id.data === c.var.user_id) {
				return user_id.data;
			}
			const user = db.getUserById(user_id.data);
			if (user !== undefined) {
				const acting_user_actions = db.getUserActionsByUserId(c.var.user_id);
				const acting_user_depts = db.getDepartmentsOfUser(c.var.user_id);
				const user_depts = db.getDepartmentsOfUser(user_id.data);
				if (
					acting_user_actions instanceof Error || acting_user_depts instanceof Error ||
					user_depts instanceof Error
				) {
					console.log(acting_user_actions);
					console.log(acting_user_depts);
					console.log(user_depts);
					return c.json({ message: "Serverside error" }, 500);
				}
				if (
					acting_user_actions.map((a) => a.actions).filter((value) =>
							allowed_actions.includes(value)
						).length > 0 ||
					(acting_user_actions.map((a) => a.actions).filter((value) =>
								allowed_ownDepartment_actions.includes(value)
							).length > 0 &&
						acting_user_depts.map((d) => d.department_id).filter((value) =>
							user_depts.map((d) => d.department_id).includes(value)
						))
				) {
					return user_id.data;
				}
			}
		}
		return c.json({ message: "Not a valid User ID" }, 400);
	});
}
function TicketValidator() {
	return validator("param", (value: ValidationFunction<string, string>, c: Context) => {
		const ticket_id = UUIDScheme.safeParse(value);
		if (ticket_id.success) {
			return ticket_id.data;
		}
		return c.json({ message: "Not a valid Ticket ID" }, 400);
	});
}
function DepartmentValidator() {
	return validator("param", (value: ValidationFunction<string, string>, c: Context) => {
		const ticket_id = UUIDScheme.safeParse(value);
		if (ticket_id.success) {
			return ticket_id.data;
		}
		return c.json({ message: "Not a valid Ticket ID" }, 400);
	});
}
// const ActionAuth = createMiddleware<{
// 	Variables: {
// 		allowed_actions: Actions[];
// 	};
// }>(
// 	async (c: Context, next: Next) => {
// 		// TODO: proper auth checking
// 		// if (!c.var.user_id == undefined) {
// 		// const user = db.getA(user_id);
// 		// return c.json({ message: "Forbidden" }, 403);
// 		await next();
// 		// }
// 	},
// );

async function createJWTAuthToken(c: Context, tokenPayload: JWTExtraPayload) {
	const iat = Math.floor(Date.now() / 1000);
	const a_exp = JWT_ACCESS_EXPIRY + iat;
	const accessToken = await sign(
		{
			...tokenPayload,
			iat: iat,
			exp: a_exp,
		},
		JWT_SECRET,
	);
	c.header("Authorization", accessToken);
}
async function createJWTRefreshToken(c: Context, tokenPayload: JWTExtraPayload) {
	const iat = Math.floor(Date.now() / 1000);
	const r_exp: number = JWT_REFRESH_EXPIRY + iat;
	const jwtToken = {
		...tokenPayload,
		iat: iat,
		exp: r_exp,
	};
	const refreshToken = await sign(jwtToken, JWT_REFRESH_SECRET);
	setCookie(c, "refreshToken", refreshToken, { maxAge: JWT_REFRESH_EXPIRY });
}
function removeJWTTokens(c: Context) {
	c.header("Authorization", "");
	deleteCookie(c, "refreshToken");
}

function verifyJWTToken(token: string | undefined, secret: string): Promise<JWTPayload> {
	return new Promise((resolve, reject) => {
		if (token) {
			verify(token, secret).then((decoded) => resolve(decoded as JWTPayload)).catch((error) =>
				reject(error)
			);
		}
		reject("token missing");
	});
}

export {
	// ActionAuth,
	createJWTAuthToken,
	createJWTRefreshToken,
	JWTAuthController,
	removeJWTTokens,
	TicketValidator,
	UserValidator,
};
