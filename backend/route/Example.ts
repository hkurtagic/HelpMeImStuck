import { Hono } from 'npm:hono@4.6.14';
import db from '../service/database.ts';

const example = new Hono();

example.get('/', (c) => {
    db.initDB();
    console.log(db.getUserByUsername('aa'));
    console.log(db.updateUserPasswordById('aa', 'aa'));
    console.log(db.deleteUserById('aa'));
    db.closeDB();
    return c.text('Hello World');
});

export default example;
