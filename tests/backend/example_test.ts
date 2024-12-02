import { assertEquals } from "@std/assert";
import t from "backend/testfile.ts"

Deno.test("Test", () => {
  assertEquals(t.fail(), "test")
})

Deno.test("Test", () => {
  assertEquals(t.success(), "test")
})
