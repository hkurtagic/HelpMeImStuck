import * as path from "jsr:@std/path";
import UserModel from "@backend/model/User.ts";
import { sequelize } from "@backend/service/dbconnector.ts";
import EventType from "@backend/model/EventType.ts";
import ActionModel from "@backend/model/Action.ts";
import Status from "@backend/model/Status.ts";
import DepartmentModel from "@backend/model/Department.ts";
import Tag from "@backend/model/Tag.ts";
import Ticket from "@backend/model/Ticket.ts";
import Event from "@backend/model/Event.ts";
import Image from "@backend/model/Image.ts";
import RoleModel from "@backend/model/Role.ts";

export default async (): Promise<void> => {
	new ActionModel();
	new DepartmentModel();
	new Event();
	new EventType();
	new Image();
	new RoleModel();
	new Status();
	new Tag();
	new Ticket();
	new UserModel();

	//1
	UserModel.belongsToMany(ActionModel, {
		through: "UserAction",
		foreignKey: "fk_user_id",
		as: "actions",
	});
	ActionModel.belongsToMany(UserModel, {
		through: "UserAction",
		foreignKey: "fk_action_id",
	});

	//2
	ActionModel.belongsToMany(RoleModel, {
		through: "RoleAction",
		foreignKey: "fk_action_id",
	});
	RoleModel.belongsToMany(ActionModel, {
		through: "RoleAction",
		foreignKey: "fk_role_id",
		as: "actions",
	});

	//User and Role association
	UserModel.belongsToMany(RoleModel, {
		through: "UserRoles",
		foreignKey: "fk_user_id",
		as: "roles",
	});
	RoleModel.belongsToMany(UserModel, { through: "UserRoles", foreignKey: "fk_role_id" });

	//Roles
	//One Department has many Roles
	DepartmentModel.hasMany(RoleModel, { foreignKey: "fk_department_id" });
	RoleModel.belongsTo(DepartmentModel, {
		foreignKey: "fk_department_id",
		as: "department",
	});

	//4
	Ticket.belongsToMany(Tag, {
		through: "TicketTag",
		foreignKey: "fk_ticket_id",
	});
	Tag.belongsToMany(Ticket, { through: "TicketTag", foreignKey: "fk_tag_id" });

	//5
	DepartmentModel.belongsToMany(Ticket, {
		through: "DepartmentTicket",
		foreignKey: "fk_department_id",
	});
	Ticket.belongsToMany(DepartmentModel, {
		through: "DepartmentTicket",
		foreignKey: "fk_ticket_id",
	});

	//Events
	//Multiple Events can have the same EventType
	EventType.hasMany(Event, { foreignKey: "fk_event_type_id" });
	Event.belongsTo(EventType, { foreignKey: "fk_event_type_id" });
	//One User can have multiple Events
	UserModel.hasMany(Event, { foreignKey: "fk_user_id" });
	Event.belongsTo(UserModel, { foreignKey: "fk_user_id" });
	//One Ticket can have many Events
	Ticket.hasMany(Event, { foreignKey: "fk_ticket_id" });
	Event.belongsTo(Ticket, { foreignKey: "fk_ticket_id" });
	//One Image belongs to one Event
	Image.hasOne(Event, { foreignKey: "fk_image_id" });
	Event.belongsTo(Image, { foreignKey: "fk_image_id" });

	//Tags
	//One Department has many Tags
	DepartmentModel.hasMany(Tag, { foreignKey: "fk_department_id" });
	Tag.belongsTo(DepartmentModel, { foreignKey: "fk_department_id" });

	//Tickets
	//One User can have multiple Tickets
	UserModel.hasMany(Ticket, { foreignKey: "fk_user_id" });
	Ticket.belongsTo(UserModel, { foreignKey: "fk_user_id" });
	//Multiple Tickets can have the same status
	Status.hasMany(Ticket, { foreignKey: "fk_status_id" });
	Ticket.belongsTo(Status, { foreignKey: "fk_status_id" });
	//
	Image.hasMany(Ticket, { foreignKey: "fk_image_id" });
	Ticket.belongsTo(Image, { foreignKey: "fk_image_id" });

	try {
		await sequelize.sync({ force: true });
		const queryInterface = sequelize.getQueryInterface();
		await queryInterface.addConstraint("Tags", {
			fields: ["fk_department_id", "tag_name"],
			type: "unique",
			name: "UniqueTagInDepartment",
		});
		await queryInterface.addConstraint("Tags", {
			fields: ["fk_department_id", "tag_abbreviation"],
			type: "unique",
			name: "UniqueTagAbbreviationInDepartment",
		});
	} catch (error) {
		throw error;
	}
};
