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
import UserDepartmentRole from "@backend/model/UserDepartmentRole.ts";

export default async (): Promise<void> => {
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
  new UserDepartmentRole();

  //1
  User.belongsToMany(Action, {
    through: "UserAction",
    foreignKey: "fk_user_id",
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
  });

  //User, Department and Role association
  User.belongsToMany(Department, {
    through: "UserDepartmentRole",
    foreignKey: "fk_user_id",
  });
  Department.belongsToMany(User, {
    through: "UserDepartmentRole",
    foreignKey: "fk_department_id",
  });

  User.belongsToMany(Role, {
    through: "UserDepartmentRole",
    foreignKey: "fk_user_id",
  });
  Role.belongsToMany(User, {
    through: "UserDepartmentRole",
    foreignKey: "fk_role_id",
  });

  //Roles
  //One Department has many Roles
  Department.hasMany(Role, { foreignKey: "fk_department_id" });
  Role.belongsTo(Department, { foreignKey: "fk_department_id" });

  //4
  Ticket.belongsToMany(Tag, {
    through: "TicketTag",
    foreignKey: "fk_ticket_id",
  });
  Tag.belongsToMany(Ticket, { through: "TicketTag", foreignKey: "fk_tag_id" });

  //5
  Department.belongsToMany(Ticket, {
    through: "DepartmentTicket",
    foreignKey: "fk_department_id",
  });
  Ticket.belongsToMany(Department, {
    through: "DepartmentTicket",
    foreignKey: "fk_ticket_id",
  });

  //Events
  //Multiple Events can have the same EventType
  EventType.hasMany(Event, { foreignKey: "fk_event_type_id" });
  Event.belongsTo(EventType, { foreignKey: "fk_event_type_id" });
  //One User can have multiple Events
  User.hasMany(Event, { foreignKey: "fk_user_id" });
  Event.belongsTo(User, { foreignKey: "fk_user_id" });
  //One Ticket can have many Events
  Ticket.hasMany(Event, { foreignKey: "fk_ticket_id" });
  Event.belongsTo(Ticket, { foreignKey: "fk_ticket_id" });
  //One Image belongs to one Event
  Image.hasOne(Event, { foreignKey: "fk_image_id" });
  Event.belongsTo(Image, { foreignKey: "fk_image_id" });

  //Tags
  //One Department has many Tags
  Department.hasMany(Tag, { foreignKey: "fk_department_id" });
  Tag.belongsTo(Department, { foreignKey: "fk_department_id" });

  //Tickets
  //One User can have multiple Tickets
  User.hasMany(Ticket, { foreignKey: "fk_user_id" });
  Ticket.belongsTo(User, { foreignKey: "fk_user_id" });
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
    await queryInterface.addConstraint("UserDepartmentRoles", {
      fields: ["fk_department_id", "fk_role_id", "fk_user_id"],
      type: "unique",
      name: "UniqueUserDepartmentRoleEntry",
    });
  } catch (error) {
    throw error;
  }
};

/*const u = new User({ user_name: "test", password_hash: "test" });
const r = new Role({ role_name: "test", role_description: "Ein Test Role" });
const d = new Department({ department_name: "test" });

await u.save();
await r.save();
await d.save();

const u = new User({ user_name: "test", password_hash: "test" });
const d = new Department({ department_name: "test" });
const s = new Status({ status_name: "test" });
const tag1 = new Tag({ tag_name: "test", tag_abbreviation: "test" });
const tag2 = new Tag({ tag_name: "uhhh", tag_abbreviation: "uh" });

await u.save();

await d.save();
await s.save();
await tag1.save();
await tag2.save();
await d.addTags([tag1, tag2]);

const t = new Ticket({
  ticket_title: "test",
  ticket_description: "test description",
});

await t.save();

await u.addTicket(t);
await s.addTicket(t);
await t.addTags([tag1, tag2]);
await tag1.addTicket(t);
await tag2.addTicket(t);*/
