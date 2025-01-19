/*import App from "@backend/App.ts";
import {expect} from "jsr:@std/expect";

Deno.test("GET /api/example", async (): Promise<void> => {
  const res: Response = await App.request("/api/example");
  expect(await res.text()).toBe("Hello World!");
});*/
import User from "../../backend/model/User.ts";
import { sequelize } from "../../backend/service/dbconnector.ts";
import { UniqueConstraintError } from "npm:sequelize@6.37.5";
import { expect } from "jsr:@std/expect";

try {
  await sequelize.sync({ force: true });
} catch (e) {
  throw new Error("Could not sync db, Test could not be executed\n" + e);
}

Deno.test("DB USER", async () => {
  let res: UniqueConstraintError | unknown | string;
  try {
    const user1 = new User({ user_name: "Haris", password_hash: "asdf" });
    const user2 = new User({ user_name: "Haris", password_hash: "dsasd" });

    await user1.save();
    await user2.save();
  } catch (e) {
    res = e;
  }

  expect(res).toBeInstanceOf(UniqueConstraintError);
});
