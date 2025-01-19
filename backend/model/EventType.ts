import { CreationOptional, DataTypes, InferCreationAttributes, Model } from "npm:sequelize";
import { sequelize } from "@backend/service/dbconnector.ts";
import { DTOEventType } from "@backend/schemes_and_types/dto_objects.ts";

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

export default class EventType extends Model<DTOEventType, InferCreationAttributes<EventType>>
	implements DTOEventType {
	declare pk_event_type_id: CreationOptional<DTOEventType["pk_event_type_id"]>;
	declare event_type_name: DTOEventType["event_type_name"];
}

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
