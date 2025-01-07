import { sign, verify } from 'hono/jwt';
import { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { Next } from 'hono/types';
import { createMiddleware } from 'hono/factory';
import { jwt_payload } from '../model/api_types.ts';

const JWT_SECRET = Deno.env.get('JWT_SECRET')!;
const JWT_ACCESS_EXPIRY = convert_to_seconds(Deno.env.get('JWT_ACCESS_EXPIRY')!);
const JWT_REFRESH_SECRET = Deno.env.get('JWT_REFRESH_SECRET')!;
// const JWT_REFRESH_EXPIRY = convert_to_seconds(Deno.env.get('JWT_REFRESH_EXPIRY')!);

function convert_to_seconds(s: string) {
    if (/^\d+$/.test(s)) {
        return Number(s);
    }
    const seconds_per_unit = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 };
    return Number(s.slice(0, -1)) * seconds_per_unit.s;
}

const JWTAuthChecker = createMiddleware(async (c: Context, next: Next) => {
    const accessToken = c.req.header('authorization');
    const refreshToken = getCookie(c, 'refreshToken');
    console.log(`JWT accessToken: ${accessToken}\nJWT refreshToken: ${refreshToken}`);

    if (!accessToken && !refreshToken) {
        c.status(401);
        return c.json({ message: 'Unauthorized' });
    }

    try {
        const decoded = await verify(accessToken!, JWT_SECRET);
        console.log('JWT auth from : ' + JSON.stringify(decoded as jwt_payload));
        c.header('user_id', (decoded as jwt_payload).user_id);
        next();
    } catch (_error) {
        if (!refreshToken) {
            c.status(401);
            return c.json({ message: 'Unauthorized' });
        }

        try {
            const decoded = await verify(refreshToken, JWT_REFRESH_SECRET);
            const payload = {
                user_id: (decoded as { user_id: string }).user_id,
                exp: Number(JWT_ACCESS_EXPIRY),
            } as jwt_payload;
            const accessToken = await sign(payload, JWT_SECRET);
            setCookie(c, 'refreshToken', refreshToken, { sameSite: 'strict' });
            c.header('authorization', accessToken);
            console.log('JWT refresh from : ' + JSON.stringify(decoded));
            c.header('user_id', (decoded as jwt_payload).user_id);
            next();
        } catch (_error) {
            c.status(400);
            return c.json({ message: 'Invalid Token.' });
        }
    }
    await next();
});

export default JWTAuthChecker;
