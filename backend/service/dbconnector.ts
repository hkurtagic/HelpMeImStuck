import User from "@backend/model/User.ts";
import { Sequelize } from "npm:sequelize";
import * as path from "jsr:@std/path";

const sequelize = new Sequelize({
  database: "HelpMeImStuck",
  dialect: "sqlite",
  storage: (path.dirname(import.meta.url), "test.db"),
});

export { sequelize };
