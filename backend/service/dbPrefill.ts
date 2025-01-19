import DepartmentModel from "@backend/model/Department.ts";
import RoleModel from "@backend/model/Role.ts";
import Status from "@backend/model/Status.ts";
import Tag from "@backend/model/Tag.ts";
import Ticket from "@backend/model/Ticket.ts";
import ActionModel from "@backend/model/Action.ts";
import UserModel from "@backend/model/User.ts";
import { Actions, DepartmentCreate, RoleCreate, UserCreate } from "@shared/shared_types.ts";
import {
	AdminActionPreset,
	RequesterActionPreset,
	S_ServerDepartment,
	S_ServersideRole,
	S_ServersideUser,
	SupporterActionPreset,
} from "@backend/schemes_and_types/serverside_schemas.ts";
import { S_Department } from "@shared/shared_schemas.ts";
import * as utils from "./dbController.ts";
import { S_DTOUserExtendedParsed } from "@backend/schemes_and_types/dto_objects.ts";
import { AlgorithmName, hash } from "@stdext/crypto/hash";

export async function prefillDB() {
	// prefill possible actions
	Object.values(Actions).forEach(async (k, v) => {
		if (typeof k === "string") {
			await ActionModel.create({
				pk_action_id: v,
				action_name: k,
			});
		}
	});

	const new_d: DepartmentCreate = {
		department_name: "System Administration",
		department_description: "Admin users",
	};
	const d = await utils.addDepartment(new_d);
	// console.log("Admin Department: " + JSON.stringify(d));

	const new_r: RoleCreate = {
		role_name: "Administrator",
		// role_description: "Administrator role",
		department: S_ServerDepartment.parse(d.toJSON()),
		actions: RequesterActionPreset.actions,
	};

	const r = await utils.addRole(new_r);
	const parsed_r = S_ServersideRole.parse(r.toJSON());
	const new_u: UserCreate = {
		user_name: "admin",
		password: "admin",
		roles: [parsed_r],
		actions: SupporterActionPreset.actions,
	};

	const u = await utils.addUser(new_u);
	console.log("Admin User: " + JSON.stringify(S_ServersideUser.parse(u!.toJSON())));

	const updated_r = parsed_r;
	updated_r.role_name = "New Role name";
	updated_r.role_description = "Administrator role";
	updated_r.actions = AdminActionPreset.actions;
	const up_r = await utils.editRole(updated_r);

	console.log("updated role: " + JSON.stringify(S_ServersideRole.parse(up_r!.toJSON())));
}

/*
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
await tag2.addTicket(t);
*/
