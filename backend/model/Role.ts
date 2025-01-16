import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";

/**
 * ```js
 * pk_role_id: {
 *     type: DataTypes.INTEGER,
 *     autoIncrement: true,
 *     primaryKey: true,
 *     allowNull: false,
 *   },
 *   role_name: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *   },
 *   role_description: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *   }
 * ```
 */

export default class Role extends Model {}

Role.init({
  pk_role_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  role_name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  role_description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, { sequelize: sequelize });
