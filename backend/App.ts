import { Hono } from 'npm:hono@4.6.14';
import { logger } from 'hono/logger';
import login from './route/Login.ts';
import test from './route/Example.ts';
import { cors } from 'hono/cors';
import database from './service/database.ts';
import { deleteCookie } from 'hono/cookie';

const app: Hono = new Hono().basePath('/api');
const logout = new Hono();
database.initDB();

/* Custom logger https://hono.dev/docs/middleware/builtin/logger */
app.use(logger());
// set cors policy

app.use(
    '*',
    cors({
        origin: (origin, c) => {
            return origin.includes('localhost') ? origin : 'http://localhost';
        },
        // allowMethods: ['POST', 'GET', 'OPTIONS'],
        // exposeHeaders: ['Set-Cookie'],
        credentials: true,
    })
);

app.route('/login', login);
app.route('/test', test);

logout.post('/logout', (c) => {
    c.header('Authorization', '');
    deleteCookie(c, 'refreshToken');
    return c.json({ message: 'User logged out successfully' }, 200);
});
export default app;
