import { Hono } from "npm:hono@4.6.14";

const example = new Hono()

example.get('/', (c) => c.text('Hello World!'))

export default example