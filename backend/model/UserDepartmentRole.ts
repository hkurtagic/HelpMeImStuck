import { DataTypes, Model } from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";

export default class UserDepartmentRole extends Model {}

UserDepartmentRole.init({
  pk_association_id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
}, { sequelize: sequelize });
