import {
	BelongsToCreateAssociationMixin,
	BelongsToGetAssociationMixin,
	BelongsToManyAddAssociationMixin,
	BelongsToManyAddAssociationsMixin,
	BelongsToManyCountAssociationsMixin,
	BelongsToManyCreateAssociationMixin,
	BelongsToManyGetAssociationsMixin,
	BelongsToManyHasAssociationMixin,
	BelongsToManyHasAssociationsMixin,
	BelongsToManyRemoveAssociationMixin,
	BelongsToManyRemoveAssociationsMixin,
	BelongsToManySetAssociationsMixin,
	BelongsToSetAssociationMixin,
	CreationOptional,
	DataTypes,
	HasManyAddAssociationMixin,
	HasManyAddAssociationsMixin,
	HasManyCountAssociationsMixin,
	HasManyCreateAssociationMixin,
	HasManyGetAssociationsMixin,
	HasManyHasAssociationMixin,
	HasManyHasAssociationsMixin,
	HasManyRemoveAssociationMixin,
	HasManyRemoveAssociationsMixin,
	HasManySetAssociationsMixin,
	Model,
} from "npm:sequelize";
import { sequelize } from "../service/dbconnector.ts";
import { DTOTicket, DTOTicketCreate } from "@backend/schemes_and_types/dto_objects.ts";
import { default as DepartmentModel } from "@backend/model/Department.ts";
import { default as UserModel } from "@backend/model/User.ts";
import { default as StatusModel } from "@backend/model/Status.ts";
import { default as EventModel } from "@backend/model/Event.ts";
import { default as TagModel } from "@backend/model/Tag.ts";
import { default as ImageModel } from "@backend/model/Image.ts";
import { ServersideTicket } from "@backend/schemes_and_types/serverside_types.ts";

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
export interface ServerTicketModel extends Model<ServersideTicket> {
}

export default class Ticket extends Model<DTOTicket, DTOTicketCreate> implements DTOTicket {
	// Properties
	declare pk_ticket_id: CreationOptional<DTOTicket["pk_ticket_id"]>;
	declare ticket_title: DTOTicket["ticket_title"];
	declare ticket_description: DTOTicket["ticket_description"];

	//#region Association Mixins
	// Since TS cannot determine model association at compile time
	// we have to declare them here purely virtually

	// Ticket.belongsToMany(Department)
	// second parameter = id or primary key type
	declare getDepartments: BelongsToManyGetAssociationsMixin<DepartmentModel>;
	declare setDepartments: BelongsToManySetAssociationsMixin<DepartmentModel, number>;
	declare addDepartments: BelongsToManyAddAssociationsMixin<DepartmentModel, number>;
	declare addDepartment: BelongsToManyAddAssociationMixin<DepartmentModel, number>;
	declare createDepartment: BelongsToManyCreateAssociationMixin<DepartmentModel>;
	declare removeDepartment: BelongsToManyRemoveAssociationMixin<DepartmentModel, number>;
	declare removeDepartments: BelongsToManyRemoveAssociationsMixin<DepartmentModel, number>;
	declare hasDepartment: BelongsToManyHasAssociationMixin<DepartmentModel, number>;
	declare hasDepartments: BelongsToManyHasAssociationsMixin<DepartmentModel, number>;
	declare countDepartments: BelongsToManyCountAssociationsMixin;

	// Ticket.belongsTo(User, {as: "author"})
	// second parameter = id or primary key type
	declare getAuthor: BelongsToGetAssociationMixin<UserModel>;
	declare setAuthor: BelongsToSetAssociationMixin<UserModel, string>;
	declare createAuthor: BelongsToCreateAssociationMixin<UserModel>;

	// Ticket.belongsTo(Status)
	// second parameter = id or primary key type
	declare getStatus: BelongsToGetAssociationMixin<StatusModel>;
	declare setStatus: BelongsToSetAssociationMixin<StatusModel, number>;
	declare createStatus: BelongsToCreateAssociationMixin<StatusModel>;

	// Ticket.BelongsToMany(Tag)
	// second parameter = id or primary key type
	declare getTags: BelongsToManyGetAssociationsMixin<TagModel>;
	declare setTags: BelongsToManySetAssociationsMixin<TagModel, number>;
	declare addTags: BelongsToManyAddAssociationsMixin<TagModel, number>;
	declare addTag: BelongsToManyAddAssociationMixin<TagModel, number>;
	declare createTag: BelongsToManyCreateAssociationMixin<TagModel>;
	declare removeTag: BelongsToManyRemoveAssociationMixin<TagModel, number>;
	declare removeTags: BelongsToManyRemoveAssociationsMixin<TagModel, number>;
	declare hasTag: BelongsToManyHasAssociationMixin<TagModel, number>;
	declare hasTags: BelongsToManyHasAssociationsMixin<TagModel, number>;
	declare countTags: BelongsToManyCountAssociationsMixin;

	// Ticket.hasMany(Event)
	// second parameter = id or primary key type
	declare getEvents: HasManyGetAssociationsMixin<EventModel>;
	declare setEvents: HasManySetAssociationsMixin<EventModel, number>;
	declare addEvents: HasManyAddAssociationsMixin<EventModel, number>;
	declare addEvent: HasManyAddAssociationMixin<EventModel, number>;
	declare createEvent: HasManyCreateAssociationMixin<EventModel>;
	declare removeEvent: HasManyRemoveAssociationMixin<EventModel, number>;
	declare removeEvents: HasManyRemoveAssociationsMixin<EventModel, number>;
	declare hasEvent: HasManyHasAssociationMixin<EventModel, number>;
	declare hasEvents: HasManyHasAssociationsMixin<EventModel, number>;
	declare countEvents: HasManyCountAssociationsMixin;

	// Ticket.hasMany(Image)
	declare getImages: HasManyGetAssociationsMixin<ImageModel>;
	declare setImages: HasManySetAssociationsMixin<ImageModel, string>;
	declare addImages: HasManyAddAssociationsMixin<ImageModel, string>;
	declare addImage: HasManyAddAssociationMixin<ImageModel, string>;
	declare createImage: HasManyCreateAssociationMixin<ImageModel>;
	declare removeImage: HasManyRemoveAssociationMixin<ImageModel, string>;
	declare removeImages: HasManyRemoveAssociationsMixin<ImageModel, string>;
	declare hasImage: HasManyHasAssociationMixin<ImageModel, string>;
	declare hasImages: HasManyHasAssociationsMixin<ImageModel, string>;
	declare countImages: HasManyCountAssociationsMixin;
	//#endregion Association Mixins

	//#region Static Methods
	static async getTicketById(ticket_id: string): Promise<ServerTicketModel | null> {
		const ticket = await Ticket.findOne({
			where: { pk_ticket_id: ticket_id },
			include: [{
				model: DepartmentModel,
				as: "departments",
				required: true,
				through: {
					attributes: [],
				},
			}, {
				model: UserModel,
				as: "author",
				required: true,
				attributes: ["pk_user_id", "user_name"],
			}, {
				model: StatusModel,
				// as: "ticket_status",
				required: true,
				attributes: ["pk_status_id"],
				// through: {
				// 	attributes: [],
				// },
			}, {
				model: TagModel,
				// as: "tags",
				// required: false,
				through: {
					attributes: [],
				},
			}, {
				model: ImageModel,
				// as: "images",
				// required: false,
				// through: {
				// 	attributes: [],
				// },
			}],
		}) as unknown as (ServerTicketModel);

		if (!ticket) return null;
		return ticket;
	}

	//#endregion Static Methods
}

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
