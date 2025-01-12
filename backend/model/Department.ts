import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";

/**
 * @type {object}
 * @property {string} department_name - A Name
 * @property {string} department_description - A short description
 */

export default class Department extends Model {}
Department.init({
  pk_department_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
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
