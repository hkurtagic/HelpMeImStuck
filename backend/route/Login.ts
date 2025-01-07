import { Hono } from 'npm:hono@4.6.14';
import { sign, verify } from 'hono/jwt';
import db from '../service/database.ts';
import { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { Next } from 'hono/types';
import { createMiddleware } from 'hono/factory';
import { LoginRequestBody } from '../model/api_types.ts';
import { AlgorithmName, verify as crypto_verify } from 'jsr:@stdext/crypto/hash';

export const login = new Hono();
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

export const JWTAuthChecker = createMiddleware(async (c: Context, next: Next) => {
    console.log(`[${c.req.method}] ${c.req.url}`);
    const accessToken = c.req.header('authorization');
    const refreshToken = getCookie(c, 'refreshToken');
    console.log(`JWT accessToken: ${accessToken}\nJWT refreshToken: ${refreshToken}`);
    //console.log(req.headers);

    if (!accessToken && !refreshToken) {
        c.status(401);
        return c.json({ message: 'Unauthorized' });
    }

    try {
        const decoded = await verify(accessToken!, JWT_SECRET);
        console.log('JWT auth from : ' + JSON.stringify(decoded as { user_id: number }));
        c.header('user_id', (decoded as { user_id: string }).user_id);
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
            };
            const accessToken = await sign(payload, JWT_SECRET);
            setCookie(c, 'refreshToken', refreshToken, { sameSite: 'strict' });
            c.header('authorization', accessToken);
            console.log('JWT refresh from : ' + JSON.stringify(decoded));
            c.header('user_id', (decoded as { user_id: string }).user_id);
            next();
        } catch (_error) {
            c.status(400);
            return c.json({ message: 'Invalid Token.' });
        }
    }
    await next();
});
/*
login.post('/login', (req, res) => {
    const { username, password } = req.body as LoginRequestBody;
    db.getUserByUsername(username, (err, user) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid Credentials' });
        }
        const accessToken = jwt.sign({ userID: user.pk_user_id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
        const refreshToken = jwt.sign({ userID: user.pk_user_id }, JWT_REFRESH_SECRET, {
            expiresIn: JWT_REFRESH_EXPIRY,
        });

        res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict' })
            .header('Authorization', accessToken)
            .json({ userID: user.pk_user_id, username: user.username });

        
        // const token = jwt.sign({ userID: user.pk_user_id }, JWT_SECRET, { expiresIn: '1h' });
        // res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
        // res.status(200).json({ token: token });
        
    });
});
*/
login.post('/login', JWTAuthChecker, async (c) => {
    const { username, password } = (await c.req.json()) as LoginRequestBody;
    const user = db.getUserByUsername(username);
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
