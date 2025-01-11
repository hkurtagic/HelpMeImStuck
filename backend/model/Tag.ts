import { DataTypes, INTEGER, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";
import Department from "./Department.ts";
import User from "./User.ts";

export default class Tag extends Model {}

Tag.init({
  pk_tag_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tag_name: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true,
  },
  tag_abbreviation: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  tag_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  tag_style: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  fk_department_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Department,
      key: "pk_department_id",
    },
  },
}, { sequelize: sequelize });
