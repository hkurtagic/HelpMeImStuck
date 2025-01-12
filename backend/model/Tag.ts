import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";

/**
 * @type {object}
 * @property {string} tag_name - A name
 * @property {string} tag_abbreviation - An abbreviation [will be displayed]
 * @property {string} tag_description - A short description of the role
 * @property {string} tag_style - The style of the tag [for the frontend]
 */

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
}, { sequelize: sequelize });
