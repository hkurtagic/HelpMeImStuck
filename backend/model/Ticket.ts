import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";
import Department from "./Department.ts";
import Status from "./Status.ts";
import User from "./User.ts";

export default class Ticket extends Model {}

Ticket.init(
  {
    pk_ticket_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    ticket_title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ticket_description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    fk_status_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Status,
        key: "pk_status_id",
      },
    },
    /*fk_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "pk_user_id",
      },
    },*/
  },
  {
    sequelize: sequelize,
  },
);
