import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";

/**
 * @type {object}
 * @property {string} status name - A name
 */

export default class Status extends Model {}

Status.init({
  pk_status_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  status_name: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
}, { sequelize: sequelize });
