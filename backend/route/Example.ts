import { Hono } from 'npm:hono@4.6.14';
import JWTAuthChecker from '../handler/AuthenticationHandler.ts';
import { decode } from 'hono/jwt';
import { jwt_payload } from '../model/api_types.ts';
import { getCookie } from 'hono/cookie';

const test = new Hono();

test.get('/login', JWTAuthChecker, async (c) => {
    let auth_head = c.req.header('Authorization');
    if (!auth_head) {
        auth_head = getCookie(c, 'refreshToken');
    }

    console.log(auth_head);
    const decoded = await decode(auth_head!);
    return c.text('You are logged in as: ' + (decoded.payload as jwt_payload).user_id);
});

export default test;
