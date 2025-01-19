import { CreationOptional, DataTypes, InferCreationAttributes, Model } from "npm:sequelize";
import { sequelize } from "@backend/service/dbconnector.ts";
import { DTOStatus } from "@backend/schemes_and_types/dto_objects.ts";

/**
 * ```js
 * pk_status_id: {
 *     type: DataTypes.INTEGER,
 *     autoIncrement: true,
 *     primaryKey: true,
 *     allowNull: false,
 *   },
 *   status_name: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *     unique: true,
 *   }
 *   ```
 */

export default class Status extends Model<DTOStatus, InferCreationAttributes<Status>>
	implements DTOStatus {
	declare pk_status_id: CreationOptional<DTOStatus["pk_status_id"]>;
	declare status_name: DTOStatus["status_name"];
}

Status.init({
	pk_status_id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		allowNull: false,
	},
	status_name: {
		type: DataTypes.TEXT,
		allowNull: false,
		unique: true,
	},
}, { sequelize: sequelize });
