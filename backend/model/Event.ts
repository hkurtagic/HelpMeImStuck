import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";

/**
 * @type {object}
 * @property {string} event_description - A short description of the event
 * @property {string} event_content - Content of the event
 */

export default class Event extends Model {}

Event.init({
  pk_event_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  event_description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  event_content: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, { sequelize: sequelize });
