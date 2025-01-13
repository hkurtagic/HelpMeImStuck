import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "@backend/service/dbconnector.ts";
import User from "./User.ts";

export default class Action extends Model {}

/**
 * @type {object}
 * @property {string} action_name - A name for the Action
 */

Action.init({
  pk_action_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  action_name: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
}, { sequelize: sequelize });
Action.belongsToMany(User, { through: "UserAction" });
