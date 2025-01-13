import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "@backend/service/dbconnector.ts";
import User from "./User.ts";

/**
 * ```js
 *   pk_action_id: {
 *     type: DataTypes.INTEGER,
 *     autoIncrement: true,
 *     primaryKey: true,
 *     allowNull: false,
 *   },
 *   action_name: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *     unique: true,
 *   }
 * ```
 */

export default class Action extends Model {}

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
