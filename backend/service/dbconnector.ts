import { Sequelize } from "npm:sequelize";
import * as path from "jsr:@std/path";

const sequelize = new Sequelize({
	database: "HelpMeImStuck",
	dialect: "sqlite",
	storage: path.fromFileUrl(path.join(path.dirname(import.meta.url), "test.db")),
	logging: false,
});
export { sequelize };
