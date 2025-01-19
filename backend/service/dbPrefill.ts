import { default as StatusModel } from "@backend/model/Status.ts";
import { default as TagModel } from "@backend/model/Tag.ts";
import { default as TicketModel } from "@backend/model/Ticket.ts";
import { default as UserModel, ServersideUserModel } from "@backend/model/User.ts";
import { default as RoleModel } from "@backend/model/Role.ts";
import { default as ActionModel } from "@backend/model/Action.ts";
import { default as DepartmentModel } from "@backend/model/Department.ts";
import {
	Actions,
	Department,
	DepartmentCreate,
	Role,
	RoleCreate,
	UserCreate,
} from "@shared/shared_types.ts";
import {
	AdminActionPreset,
	RequesterActionPreset,
	S_ServerDepartment,
	S_ServersideRole,
	S_ServersideUser,
	SupporterActionPreset,
} from "@backend/schemes_and_types/serverside_schemas.ts";
import { S_Department } from "@shared/shared_schemas.ts";
import * as dbController from "./dbController.ts";
import { S_DTOUserExtendedParsed } from "@backend/schemes_and_types/dto_objects.ts";
import { AlgorithmName, hash } from "@stdext/crypto/hash";
import { ServersideRole, ServersideUser } from "@backend/schemes_and_types/serverside_types.ts";

export async function prefillDB() {
	// prefill possible actions
	// Object.values(Actions).forEach(async (k, v) => {
	// 	if (typeof k === "string") {
	// 		await ActionModel.create({
	// 			pk_action_id: v,
	// 			action_name: k,
	// 		});
	// 	}
	// });
	Object.values(Actions).forEach(async (k, v) => {
		if (typeof k === "string") {
			await dbController.addAction(k);
		}
	});
	// #region Admin
	const new_d: DepartmentCreate = {
		department_name: "System Administration",
		department_description: "Admin users",
	};
	const d = await dbController.addDepartment(new_d);

	const new_r: RoleCreate = {
		role_name: "Administrator",
		role_description: "Administrator role",
		department: S_ServerDepartment.parse(d.toJSON()),
		actions: AdminActionPreset.actions,
	};
	const r = await dbController.addRole(new_r);

	const parsed_r = S_ServersideRole.parse(r.toJSON());
	const new_u: UserCreate = {
		user_name: "admin",
		password: "admin",
		roles: [parsed_r],
		actions: SupporterActionPreset.actions,
	};
	await dbController.addUser(new_u);
	// #endregion Admin

	await testDB();
}
async function testDB() {
	//test department creation
	const test_create_d: DepartmentCreate = {
		department_name: "IT",
		// department_description: "Admin users",
	};
	const d_create = await dbController.addDepartment(test_create_d);
	const d_create_parsed = S_ServerDepartment.parse(d_create.toJSON());
	console.info("> created department: " + JSON.stringify(d_create_parsed));

	//test role creation
	const test_create_r: RoleCreate = {
		role_name: "IT Supporter",
		// role_description: "Administrator role",
		department: d_create_parsed,
		actions: SupporterActionPreset.actions,
	};
	const r_create = await dbController.addRole(test_create_r);
	const r_create_parsed = S_ServersideRole.parse(r_create.toJSON());

	// test user creation
	const test_create_u: UserCreate = {
		user_name: "ITsupporter",
		password: "test",
		roles: [r_create_parsed],
		// actions: SupporterActionPreset.actions,
	};
	const u_create = await dbController.addUser(test_create_u);
	const u_create_parsed = S_ServersideUser.parse(u_create?.toJSON());

	// test department update
	const test_update_d: Department = {
		department_id: d_create_parsed.department_id,
		department_name: d_create_parsed.department_name,
		department_description: "Admin users",
	};
	const d_update = await dbController.editDepartment(test_update_d);
	const d_update_parsed = S_ServerDepartment.parse(d_update!.toJSON());
	console.info("> updated department: " + JSON.stringify(d_update_parsed));

	// test role update
	// const updated_r = parsed_r;
	const test_update_r: ServersideRole = {
		role_id: r_create_parsed.role_id,
		role_name: "IT requester",
		role_description: "IT requester role",
		department: r_create_parsed.department,
		actions: RequesterActionPreset.actions,
	};
	console.log("> old role: " + JSON.stringify(r_create_parsed));
	const r_update = await dbController.editRole(test_update_r);
	const r_update_parsed = S_ServersideRole.parse(r_update!.toJSON());
	console.log("updated role: " + JSON.stringify(r_update_parsed));

	const d2 = await dbController.getDepartment({ department_name: "System Administration" });
	const r2 = await dbController.getRole({
		role_name: "Administrator",
		department_id: d2?.toJSON().pk_department_id!,
	});
	const r2_parsed = S_ServersideRole.parse(r2!.toJSON());
	// test user update
	const test_update_u: ServersideUser = {
		user_id: u_create_parsed.user_id,
		user_name: "ITsupporter",
		password: u_create_parsed.password,
		roles: [r_create_parsed, r2_parsed],
		actions: SupporterActionPreset.actions,
	};
	console.log("> old user: " + JSON.stringify(u_create_parsed));
	const u_update = await dbController.editUser(test_update_u);
	const u_update_parsed = S_ServersideUser.parse(u_update!.toJSON());
	console.log("updated user: " + JSON.stringify(u_update_parsed));
	/*
	//test user delete
	const test_delete_u = test_update_u;
	const u_delete = await dbController.deleteUser(test_delete_u);
	// const d_delete_parsed = S_ServerDepartment.parse(d_delete!.toJSON());
	console.info("> user deleted?: " + JSON.stringify(u_delete));

	//test role delete
	const test_delete_r = test_update_r;
	const r_delete = await dbController.deleteRole(test_delete_r);
	// const d_delete_parsed = S_ServerDepartment.parse(d_delete!.toJSON());
	console.info("> role deleted?: " + JSON.stringify(r_delete));

	// test department delete
	const test_delete_d = test_update_d;
	const d_delete = await dbController.deleteDepartment(test_delete_d);
	// const d_delete_parsed = S_ServerDepartment.parse(d_delete!.toJSON());
	console.info("> department deleted?: " + JSON.stringify(d_delete));
	*/
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
