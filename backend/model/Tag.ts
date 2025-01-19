import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";

/**
 * ```js
 * pk_tag_id: {
 *     type: DataTypes.INTEGER,
 *     autoIncrement: true,
 *     primaryKey: true,
 *     allowNull: false,
 *   },
 *   tag_name: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *     unique: true,
 *   },
 *   tag_abbreviation: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *   },
 *   tag_description: {
 *     type: DataTypes.TEXT,
 *     allowNull: true,
 *   },
 *   tag_style: {
 *     type: DataTypes.TEXT,
 *     allowNull: true,
 *   }
 * ```
 */

export default class Tag extends Model {}

Tag.init({
  pk_tag_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
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
