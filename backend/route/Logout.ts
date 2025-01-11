import { deleteCookie } from "hono/cookie";
import { Hono } from "hono";
import { JWTAuthController } from "../controller/AuthenticationController.ts";

const logout = new Hono();

logout.post("/", JWTAuthController, (c) => {
	console.log(
		"logout initiated with access token: \n" + c.req.header("Authorization"),
	);
	console.log(c.req);
	c.header("Authorization", "");
	deleteCookie(c, "refreshToken");
	return c.json({ message: "User logged out successfully" }, 200);
});

export default logout;
