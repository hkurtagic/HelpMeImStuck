import { Hono } from 'npm:hono@4.6.14';
import { logger } from 'hono/logger';
import { login } from './route/Login.ts';

const app: Hono = new Hono().basePath('/api');

/* Custom logger https://hono.dev/docs/middleware/builtin/logger */
app.use(logger());

app.route('/login', login);

export default app;
