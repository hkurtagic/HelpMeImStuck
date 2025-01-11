import User from "@backend/model/User.ts";
import { sequelize } from "./dbconnector.ts";
import EventType from "../model/EventType.ts";
import Action from "../model/Action.ts";
import Status from "../model/Status.ts";
import Department from "../model/Department.ts";
import Tag from "../model/Tag.ts";
import Ticket from "../model/Ticket.ts";

new User();
new EventType();
new Action();
new Status();
new Department();
new Tag();
new Ticket();

// One Department has many Tags
Tag.belongsTo(Department, {
  foreignKey: "fk_department_id",
});
Department.hasMany(Tag, {});

Ticket.belongsTo(User, {
  foreignKey: "fk_user_id",
});
User.hasMany(Ticket, {});

Ticket.belongsTo(Status, {
  foreignKey: "fk_status_id",
});

try {
  const u = new User({ user_name: "test", password_hash: "test" });
  const s = new Status({ status_name: "test" });
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

  await u.save();
  await s.save();
  const t = new Ticket({
    ticket_title: "test",
    fk_status_id: "test",
    ticket_description: "test description",
    fk_department_id: s.get("pk_status_id"),
  });

  await t.save();
} catch (error) {
  console.error(error);
}
