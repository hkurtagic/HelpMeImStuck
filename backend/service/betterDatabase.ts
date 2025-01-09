import { DataTypes, Sequelize } from "npm:sequelize";
import * as path from "jsr:@std/path";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: (path.dirname(import.meta.url), "test.db"),
});

const User = sequelize.define("User", {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

try {
  await sequelize.sync({ force: true });
  await User.create({
    username: "test",
  });
} catch (error) {
  console.error(error);
}
