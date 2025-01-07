import { sign, verify, decode } from 'hono/jwt';
import { Context } from 'hono';
import { getCookie } from 'hono/cookie';
import { Next } from 'hono/types';
import { createMiddleware } from 'hono/factory';
import { jwt_payload } from '../model/api_types.ts';

const JWT_SECRET = Deno.env.get('JWT_SECRET')!;
const JWT_ACCESS_EXPIRY = parseInt(Deno.env.get('JWT_ACCESS_EXPIRY')!);
const JWT_REFRESH_SECRET = Deno.env.get('JWT_REFRESH_SECRET')!;
// const JWT_REFRESH_EXPIRY = convert_to_seconds(Deno.env.get('JWT_REFRESH_EXPIRY')!);

const JWTAuthChecker = createMiddleware(async (c: Context, next: Next) => {
    const accessToken = c.req.header('Authorization');
    const refreshToken = getCookie(c, 'refreshToken');
    console.log(`JWT accessToken: ${accessToken}\nJWT refreshToken: ${refreshToken}`);
    if (accessToken) {
        console.log(`decoded JWT accessToken: ${JSON.stringify(decode(accessToken!).payload)}`);
    }
    if (refreshToken) {
        console.log(`decoded JWT refreshToken: ${JSON.stringify(decode(refreshToken!).payload)}`);
    }

    if (!accessToken && !refreshToken) {
        return c.json({ message: 'Unauthorized' }, 401);
    }

    try {
        const decoded = await verify(accessToken!, JWT_SECRET);
        console.log('JWT auth from : ' + JSON.stringify(decoded as jwt_payload));
        c.header('user_id', (decoded as jwt_payload).user_id);
    } catch (_error1) {
        if (!refreshToken) {
            return c.json({ message: 'Unauthorized' }, 401);
        }

        try {
            const decoded = await verify(refreshToken, JWT_REFRESH_SECRET);
            const iat = Math.floor(Date.now() / 1000);
            const a_exp = JWT_ACCESS_EXPIRY + iat;
            const accessToken = await sign(
                {
                    user_id: decoded.user_id,
                    iat: iat,
                    exp: a_exp,
                },
                JWT_SECRET
            );
            // setCookie(c, 'refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' });
            c.header('Authorization', accessToken);
            //c.header('user_id', (decoded as jwt_payload).user_id);
        } catch (_error2) {
            console.log('_error1\n');
            console.log(_error1);
            console.log('_error2\n');
            console.log(_error2);
            return c.json({ message: 'Invalid Token.' }, 400);
        }
    }
    await next();
});

export default JWTAuthChecker;
