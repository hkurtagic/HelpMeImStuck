import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";

export default class Event extends Model {}

Event.init({}, { sequelize: sequelize });
