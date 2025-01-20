import {
	BelongsToGetAssociationMixin,
	BelongsToSetAssociationMixin,
	CreationOptional,
	DataTypes,
	InferCreationAttributes,
	Model,
} from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";
import EventType from "@backend/model/EventType.ts";
import { DTOEvent } from "@backend/schemes_and_types/dto_objects.ts";

/**
 * ```js
 * pk_event_id: {
 *     type: DataTypes.INTEGER,
 *     autoIncrement: true,
 *     primaryKey: true,
 *     allowNull: false,
 *   },
 *   event_description: {
 *     type: DataTypes.TEXT,
 *     allowNull: true,
 *   },
 *   event_content: {
 *     type: DataTypes.TEXT,
 *     allowNull: true,
 *   }
 * ```
 */

export default class Event extends Model<DTOEvent, InferCreationAttributes<Event>>
	implements DTOEvent {
	// Properties
	declare pk_event_id: CreationOptional<DTOEvent["pk_event_id"]>;
	declare event_description: DTOEvent["event_description"];
	declare event_content: DTOEvent["event_content"];
	declare getEventType: BelongsToGetAssociationMixin<EventType>;
	declare setEventType: BelongsToSetAssociationMixin<EventType, number>;
}

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
		allowNull: false,
	},
}, { sequelize: sequelize });
