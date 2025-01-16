import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "@backend/service/dbconnector.ts";

/**
 * ```js
 * pk_event_type_id: {
 *       type: DataTypes.INTEGER,
 *       autoIncrement: true,
 *       primaryKey: true,
 *       allowNull: false,
 *     },
 *     event_type_name: {
 *       type: DataTypes.TEXT,
 *       allowNull: false,
 *       unique: true,
 *     }
 * ```
 */

export default class EventType extends Model {}

EventType.init(
  {
    pk_event_type_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    event_type_name: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize: sequelize,
  },
);
