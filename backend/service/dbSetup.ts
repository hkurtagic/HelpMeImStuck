import * as path from "jsr:@std/path";
import User from "@backend/model/User.ts";
import { sequelize } from "@backend/service/dbconnector.ts";
import EventType from "@backend/model/EventType.ts";
import Action from "@backend/model/Action.ts";
import Status from "@backend/model/Status.ts";
import Department from "@backend/model/Department.ts";
import Tag from "@backend/model/Tag.ts";
import Ticket from "@backend/model/Ticket.ts";
import Event from "@backend/model/Event.ts";
import Image from "@backend/model/Image.ts";
import Role from "@backend/model/Role.ts";

export default async function dbModelSetup(wipe_db_on_restart = true): Promise<void> {
    new Action();
    new Department();
    new Event();
    new EventType();
    new Image();
    new Role();
    new Status();
    new Tag();
    new Ticket();
    new User();

    //1
    User.belongsToMany(Action, {
        through: "UserAction",
        foreignKey: "fk_user_id",
        as: "actions",
    });
    Action.belongsToMany(User, {
        through: "UserAction",
        foreignKey: "fk_action_id",
    });

    //2
    Action.belongsToMany(Role, {
        through: "RoleAction",
        foreignKey: "fk_action_id",
    });
    Role.belongsToMany(Action, {
        through: "RoleAction",
        foreignKey: "fk_role_id",
        as: "actions",
    });

    //User and Role association
    User.belongsToMany(Role, {
        through: "UserRoles",
        foreignKey: "fk_user_id",
        as: "roles",
    });
    Role.belongsToMany(User, {
        through: "UserRoles",
        foreignKey: "fk_role_id",
        onDelete: "RESTRICT",
    });

    //Roles
    //One Department has many Roles
    Department.hasMany(Role, { foreignKey: "fk_department_id", onDelete: "CASCADE" });
    Role.belongsTo(Department, {
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
    Ticket.belongsToMany(Department, {
        through: "DepartmentTicket",
        foreignKey: "fk_ticket_id",
        as: "departments",
    });
    Department.belongsToMany(Ticket, {
        through: "DepartmentTicket",
        foreignKey: "fk_department_id",
        onDelete: "NO ACTION",
    });

    //Events
    //Multiple Events can have the same EventType
    EventType.hasMany(Event, { foreignKey: "fk_event_type_id" });
    Event.belongsTo(EventType, { foreignKey: "fk_event_type_id" });
    //One User can have multiple Events
    User.hasMany(Event, { foreignKey: "fk_user_id" });
    Event.belongsTo(User, { foreignKey: "fk_user_id", as: "author" });
    //One Ticket can have many Events
    Ticket.hasMany(Event, { foreignKey: "fk_ticket_id", onDelete: "CASCADE" });
    Event.belongsTo(Ticket, { foreignKey: "fk_ticket_id" });
    //One Image belongs to one Event / One Event can have multiple Images
    Image.belongsTo(Event, { foreignKey: "fk_event_id" });
    Event.hasMany(Image, { foreignKey: "fk_event_id", onDelete: "CASCADE" });

    //Tags
    //One Department has many Tags
    Department.hasMany(Tag, { foreignKey: "fk_department_id", onDelete: "CASCADE" });
    Tag.belongsTo(Department, { foreignKey: "fk_department_id" });

    //Tickets
    //One User can have multiple Tickets
    User.hasMany(Ticket, { foreignKey: "fk_user_id", onDelete: "NO ACTION" });
    Ticket.belongsTo(User, { foreignKey: "fk_user_id", as: "author" });
    // Multiple Tickets can have the same status
    Status.hasMany(Ticket, { foreignKey: "fk_status_id" });
    Ticket.belongsTo(Status, { foreignKey: "fk_status_id" });
    // One Tickets can have multiple images / One Image blengs to one Event
    Image.belongsTo(Ticket, { foreignKey: "fk_ticket_id" });
    Ticket.hasMany(Image, { foreignKey: "fk_ticket_id", onDelete: "CASCADE" });
    if (wipe_db_on_restart) {
        await dropTablesAndSetConstraints();
    }
}
export async function dropTablesAndSetConstraints() {
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
}
