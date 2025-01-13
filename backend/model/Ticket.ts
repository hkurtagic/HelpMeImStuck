import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";

/**
 * @type {object}
 * @property {string} ticket_title - The title of the ticket
 * @property {string} ticket_description - A short description of the Ticket
 */

export default class Ticket extends Model {}

Ticket.init(
  {
    pk_ticket_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    ticket_title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ticket_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
  },
);
