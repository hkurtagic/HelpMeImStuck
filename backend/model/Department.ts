import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";

/**
 * ```js
 * pk_department_id: {
 *     type: DataTypes.INTEGER,
 *     autoIncrement: true,
 *     primaryKey: true,
 *     allowNull: false,
 *   },
 *   department_name: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *     unique: true,
 *   },
 *   department_description: {
 *     type: DataTypes.TEXT,
 *     allowNull: true,
 *   },
 * ```
 */

export default class Department extends Model {}
Department.init({
  pk_department_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  department_name: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  department_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, { sequelize: sequelize });
