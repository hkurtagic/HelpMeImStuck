import { Hono } from 'npm:hono@4.6.14';
import JWTAuthChecker from '../handler/AuthenticationHandler.ts';
import { decode } from 'hono/jwt';
import { jwt_payload } from '../model/api_types.ts';

const example = new Hono();

example.get('/', JWTAuthChecker, async (c) => {
    const decoded = await decode(c.req.header('authorization')!);
    return c.text('You are logged in as: ' + (decoded.payload as jwt_payload).user_id);
});

export default example;
