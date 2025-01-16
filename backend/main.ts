import App from "@backend/App.ts";
import setupDb from "@backend/service/setupDb.ts";
import { addUser, deleteUser, editUser } from "./service/dbUtils.ts";
import User from "./model/User.ts";
import Department from "./model/Department.ts";
import Role from "./model/Role.ts";

try {
  await setupDb();
  console.log("Database initialized");
  Deno.serve({ port: Number(Deno.env.get("PORT")!) || 8000 }, App.fetch);

  const u = new User({ user_name: "testUser", password_hash: "einPassword" });
  const d = new Department({ department_name: "testDep" });
  let r = new Role({
    role_name: "testRole",
    role_description: "Ein Test Role",
  });
  let r2 = new Role({
    role_name: "testRole1",
    role_description: "Ein Test Role",
  });
  await d.save();
  await r.save();
  await r2.save();
  //@ts-expect-error: <IDE does not like sequelize magic>
  await d.addRoles([r, r2]);

  let test = await addUser(u, ["testRole", "testRole1"]);
  u.setDataValue("user_name", "User");
  test = await editUser(u, ["testRole1"]);
  console.log(test);
} catch (error) {
  console.error(error);
}
