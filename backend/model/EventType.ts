import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "@backend/service/dbconnector.ts";

/**
 * @type {object}
 * @property {string} event_type_name - A name for the event_type
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
