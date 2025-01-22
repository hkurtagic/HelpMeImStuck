import { Hono } from "hono";
import { JWTAuthController } from "../controller/AuthenticationController.ts";
import { decode, sign } from "hono/jwt";
import { setCookie } from "hono/cookie";
import { JWTExtraPayload } from "@backend/schemes_and_types/serverside_types.ts";
import { getCookie } from "hono/cookie";
// import db from "@backend/service/database.ts";
import { getTestData } from "../../tests/backend/sync.ts";
// import { base64toBlob, BlobToBase64 } from "@backend/handler/ImageHandler.ts";
// import { Base64, ImageType } from "@shared/shared_types.ts";

const test = new Hono();
const testData = getTestData();

const JWT_SECRET: string = Deno.env.get("JWT_SECRET")!;
const JWT_ACCESS_EXPIRY: number = parseInt(Deno.env.get("JWT_ACCESS_EXPIRY")!);
const JWT_REFRESH_SECRET: string = Deno.env.get("JWT_REFRESH_SECRET")!;
const JWT_REFRESH_EXPIRY: number = parseInt(
    Deno.env.get("JWT_REFRESH_EXPIRY")!,
);

test.get("/login", async (c) => {
    // const user = db.getUserByUsername("Admin");
    // if (user instanceof Error) {
    // 	return c.json({ error: user.message }, 500);
    // }

    // if (user == undefined) {
    // 	return c.json({ error: "Invalid Credentials" }, 401);
    // }
    const user = testData.users.filter((u) => u.user_id === "2")[0];
    const iat: number = Math.floor(Date.now() / 1000);
    const a_exp: number = JWT_ACCESS_EXPIRY + iat;
    const accessToken = await sign(
        {
            user_id: user.user_id,
            iat: iat,
            exp: a_exp,
        },
        JWT_SECRET,
    );
    const r_exp: number = JWT_REFRESH_EXPIRY + iat;
    const refreshToken = await sign(
        {
            user_id: user.user_id,
            iat: iat,
            exp: r_exp,
        },
        JWT_REFRESH_SECRET,
    );
    console.log("maxAge: " + JWT_REFRESH_EXPIRY);
    setCookie(c, "refreshToken", refreshToken, { maxAge: JWT_REFRESH_EXPIRY });
    c.header("Authorization", accessToken);
    return c.json({ user_id: user.user_id, username: user.user_name }, 200);
});

test.get("/logged_in", JWTAuthController, async (c) => {
    let auth_head = c.req.header("Authorization");
    if (!auth_head) {
        auth_head = getCookie(c, "refreshToken");
    }

    console.log(auth_head);
    const decoded = await decode(auth_head!);
    return c.text(
        "You are logged in as: " + (decoded.payload as JWTExtraPayload).user_id,
    );
});

// test.get("/image_to_blob", (c) => {
//   const blob = base64toBlob(c.req.query("image") as Base64<ImageType>);
//   console.log(blob);
//   // console.log("--------------------------------");
//   // const b64 = BlobToBase64(blob);
//   // console.log(b64);
//   return c.json({ image: blob }, 200);
// });

export default test;
