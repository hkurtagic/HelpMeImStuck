import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";

/**
 * @type {object}
 * @property {string} department_name - A name for the department
 * @property {string} department_description - A short description for the department
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
