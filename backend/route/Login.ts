import { Hono } from "hono";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";
import {
  AlgorithmName,
  verify as crypto_verify,
} from "jsr:@stdext/crypto/hash";
import db from "@backend/service/database.ts";
import { LoginRequestBody } from "@shared/shared_types.ts";

const login = new Hono();
const JWT_SECRET: string = Deno.env.get("JWT_SECRET")!;
const JWT_ACCESS_EXPIRY: number = parseInt(Deno.env.get("JWT_ACCESS_EXPIRY")!);
const JWT_REFRESH_SECRET: string = Deno.env.get("JWT_REFRESH_SECRET")!;
const JWT_REFRESH_EXPIRY: number = parseInt(
  Deno.env.get("JWT_REFRESH_EXPIRY")!,
);

login.post("/", async (c) => {
  const { username, password } = (await c.req.json()) as LoginRequestBody;
  console.log("login attempt with: " + username + "\nand pw: " + password);
  const user = db.getUserByUsername(username);
  console.log("dbUser: " + user);
  if (user instanceof Error) {
    return c.json({ error: user.message }, 500);
  }

  if (
    typeof user == "undefined" ||
    !crypto_verify(AlgorithmName.Argon2, password, user.password_hash)
  ) {
    return c.json({ error: "Invalid Credentials" }, 401);
  }
  const iat: number = Math.floor(Date.now() / 1000);
  const a_exp: number = JWT_ACCESS_EXPIRY + iat;
  const accessToken = await sign(
    {
      user_id: user.pk_user_id,
      iat: iat,
      exp: a_exp,
    },
    JWT_SECRET,
  );
  const r_exp: number = JWT_REFRESH_EXPIRY + iat;
  const refreshToken = await sign(
    {
      user_id: user.pk_user_id,
      iat: iat,
      exp: r_exp,
    },
    JWT_REFRESH_SECRET,
  );
  console.log("maxAge: " + JWT_REFRESH_EXPIRY);
  setCookie(c, "refreshToken", refreshToken, { maxAge: JWT_REFRESH_EXPIRY });
  /*
    setCookie(c, 'refreshToken', refreshToken, {
        sameSite: 'strict',
        // secure: true,
        // domain: 'localhost',
    });
    // c.header('Access-Control-Allow-Origin', 'localhost');
    // c.header('Access-Control-Allow-Credentials', 'true');
    // c.header('access-control-expose-headers', 'Set-Cookie');
    */
  c.header("Authorization", accessToken);
  return c.json({ user_id: user.pk_user_id, username: user.user_name }, 200);
});
login.get("/", (c) => {
  return c.text("not bricked", 200);
});

export default login;
