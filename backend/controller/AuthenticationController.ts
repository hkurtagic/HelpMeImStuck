import { decode, sign, verify } from "hono/jwt";
import { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { Next } from "hono/types";
import { createMiddleware } from "hono/factory";
import { JWTExtraPayload, JWTPayload } from "@backend/schemes_and_types/serverside_types.ts";
// import db from "@backend/service/database.ts";
import * as dbController from "@backend/service/dbController.ts";

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
                user_id = (await verifyJWTToken(refreshToken!, JWT_REFRESH_SECRET)).user_id;
                createJWTAuthToken(c, { user_id: user_id });
            } catch (_error2) {
                console.log("access token verification error: ");
                console.log(_error1);
                console.log("refresh token verification error:");
                console.log(_error2);
                return c.json({ message: "Invalid Token." }, 400);
            }
        }
        const user = dbController.getUser({ user_id: user_id });
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
            return verify(token, secret)
                .then((decoded) => {
                    console.log("verified token" + JSON.stringify(decoded));
                    resolve(decoded as JWTPayload);
                })
                .catch((error) => {
                    reject(error);
                });
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
};
