import { Hono } from 'npm:hono@4.6.14';
import { sign } from 'hono/jwt';
import db from '../service/database.ts';
import { setCookie } from 'hono/cookie';
import { LoginRequestBody } from '../model/api_types.ts';
import { AlgorithmName, verify as crypto_verify } from 'jsr:@stdext/crypto/hash';

const login = new Hono();
const JWT_SECRET = Deno.env.get('JWT_SECRET')!;
const JWT_ACCESS_EXPIRY = convert_to_seconds(Deno.env.get('JWT_ACCESS_EXPIRY')!);
const JWT_REFRESH_SECRET = Deno.env.get('JWT_REFRESH_SECRET')!;
const JWT_REFRESH_EXPIRY = convert_to_seconds(Deno.env.get('JWT_REFRESH_EXPIRY')!);

function convert_to_seconds(s: string) {
    if (/^\d+$/.test(s)) {
        return Number(s);
    }
    const seconds_per_unit = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
    return Number(s.slice(0, -1)) * seconds_per_unit.s;
}

login.post('/', async (c) => {
    const { username, password } = (await c.req.json()) as LoginRequestBody;
    const user = db.getUserByUsername(username);
    console.log();
    if (user instanceof Error) {
        c.status(500);
        return c.json({ error: user.message });
    }

    if (
        typeof user == 'undefined' ||
        !crypto_verify(AlgorithmName.Argon2, password, user.password_hash)
    ) {
        c.status(401);
        return c.json({ error: 'Invalid Credentials' });
    }
    const accessToken = await sign(
        {
            user_id: user.pk_user_id,
            exp: Number(JWT_ACCESS_EXPIRY),
        },
        JWT_SECRET
    );
    const refreshToken = await sign(
        {
            user_id: user.pk_user_id,
            exp: Number(JWT_REFRESH_EXPIRY),
        },
        JWT_REFRESH_SECRET
    );
    setCookie(c, 'refreshToken', refreshToken, { sameSite: 'strict' });
    c.header('authorization', accessToken);
    return c.json({ user_id: user.pk_user_id, username: user.user_name });
});
login.get('/', (c) => {
    console.log('aaaa');
    c.status(202);
    return c.text('not bricked');
});

export default login;
