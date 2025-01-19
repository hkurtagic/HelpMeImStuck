import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";

/**
 * ```js
 * pk_ticket_id: {
 *       type: DataTypes.UUID,
 *       primaryKey: true,
 *       defaultValue: DataTypes.UUIDV4,
 *       allowNull: false,
 *     },
 *     ticket_title: {
 *       type: DataTypes.TEXT,
 *       allowNull: false,
 *     },
 *     ticket_description: {
 *       type: DataTypes.TEXT,
 *       allowNull: false,
 *     }
 * ```
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
