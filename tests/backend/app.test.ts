import App from "@backend/App.ts";
import {expect} from "jsr:@std/expect";

Deno.test("GET /api/example", async (): Promise<void> => {
  const res: Response = await App.request("/api/example");
  expect(await res.text()).toBe("Hello World!");
});
