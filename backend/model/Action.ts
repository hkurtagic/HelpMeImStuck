import {
	CreationOptional,
	DataTypes,
	InferAttributes,
	InferCreationAttributes,
	Model,
} from "npm:sequelize";
import { sequelize } from "@backend/service/dbconnector.ts";
import { DTOAction } from "@backend/schemes_and_types/dto_objects.ts";

/**
 * ```js
 *   pk_action_id: {
 *     type: DataTypes.INTEGER,
 *     autoIncrement: true,
 *     primaryKey: true,
 *     allowNull: false,
 *   },
 *   action_name: {
 *     type: DataTypes.TEXT,
 *     allowNull: false,
 *     unique: true,
 *   }
 * ```
 */

export default class ActionModel
	extends Model<InferAttributes<ActionModel>, InferCreationAttributes<ActionModel>>
	implements DTOAction {
	// Properties
	declare pk_action_id: CreationOptional<DTOAction["pk_action_id"]>;
	declare action_name: DTOAction["action_name"];
}

ActionModel.init({
	pk_action_id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
		allowNull: false,
		field: "pk_action_id",
	},
	action_name: {
		type: DataTypes.TEXT,
		allowNull: false,
		unique: true,
	},
}, { sequelize: sequelize });
