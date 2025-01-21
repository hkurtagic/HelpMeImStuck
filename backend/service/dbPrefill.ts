import {
	Actions,
	Department,
	DepartmentCreate,
	EventType,
	RoleCreate,
	TicketCreate,
	TicketEvent,
	TicketStatus,
	UserAdmin,
	UserCreate,
} from "@shared/shared_types.ts";
import {
	AdminActionPreset,
	RequesterActionPreset,
	S_ServerDepartment,
	S_ServersideRole,
	S_ServersideUser,
	S_ServerTicket,
	SupporterActionPreset,
} from "@backend/schemes_and_types/serverside_schemas.ts";
import * as dbController from "./dbController.ts";
import { ServersideRole, ServersideUser } from "@backend/schemes_and_types/serverside_types.ts";
import { S_User, S_UserAdmin } from "@shared/shared_schemas.ts";

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
	Object.values(Actions).forEach(async (k, _) => {
		if (typeof k === "string") {
			await dbController.addAction(k);
		}
	});
	Object.values(TicketStatus).forEach(async (k, _) => {
		if (typeof k === "string") {
			await dbController.addStatus(k);
		}
	});
	Object.values(EventType).forEach(async (k, _) => {
		if (typeof k === "string") {
			await dbController.addEventType(k);
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

	await dbController.addRole(new_r);
	const r = await dbController.getRole({
		role_name: new_r.role_name,
		department_id: new_r.department.department_id,
	});
	const parsed_r = S_ServersideRole.parse(r!.toJSON());
	const new_u: UserCreate = {
		user_name: "Administrator",
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
	await dbController.addRole(test_create_r);
	const r_create = await dbController.getRole({
		role_name: test_create_r.role_name,
		department_id: test_create_r.department.department_id,
	});
	const r_create_parsed = S_ServersideRole.parse(r_create!.toJSON());

	// test user creation
	const test_create_u: UserCreate = {
		user_name: "ITsupporter",
		password: "test",
		roles: [r_create_parsed],
		// actions: SupporterActionPreset.actions,
	};
	await dbController.addUser(test_create_u);
	const u_create = await dbController.getUser({ user_name: test_create_u.user_name });
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
	const test_update_u: UserAdmin = {
		user_id: u_create_parsed.user_id,
		user_name: "ITsupporter",
		password: u_create_parsed.password,
		roles: [r_create_parsed, r2_parsed],
		actions: SupporterActionPreset.actions,
	};
	console.log("> old user: " + JSON.stringify(u_create_parsed));
	const u_update = await dbController.editUser(S_UserAdmin.parse(test_update_u));
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

	// test_ticket
	const test_create_t: TicketCreate = {
		author: { user_id: u_update_parsed.user_id, user_name: u_update_parsed.user_name },
		departments: [d_update_parsed],
		ticket_title: "test_ticket",
		ticket_description: "ticket description",
	};

	console.info("> new ticket: " + JSON.stringify(test_create_t));
	const t_create = (await dbController.addTicket(test_create_t))!;
	const t_create_parsed = S_ServerTicket.parse(t_create!.toJSON());
	console.info("> created ticket: " + JSON.stringify(t_create_parsed));

	const t_all_of_user = await dbController.getAllTicketsOf({
		author_id: test_create_t.author.user_id,
	});
	const t_all_of_user_parsed = t_all_of_user?.map((ticket) =>
		S_ServerTicket.parse(ticket.toJSON())
	);
	console.info(
		"> all tickets of " + test_create_t.author.user_name + ": " +
			JSON.stringify(t_all_of_user_parsed),
	);
	// test add event
	const test_create_e: TicketEvent = {
		author: t_create_parsed.author,
		ticket_id: t_create_parsed.ticket_id,
		// created_at: t_create.toJSON().created_at,
		event_type: EventType.createTicket,
	};
	await dbController.addEvent(test_create_e);
	const u_create_e2 = S_ServersideUser.parse(
		(await dbController.getUser({ user_name: "Administrator" }))!.toJSON()!,
	);
	console.log("> second ticket event user:");
	console.log({ user_id: u_create_e2.user_id, user_name: u_create_e2.user_name });

	const test_create_e2: TicketEvent = {
		author: { user_id: u_create_e2.user_id, user_name: u_create_e2.user_name },
		ticket_id: t_create_parsed.ticket_id,
		event_type: EventType.statusChange,
		new_status: TicketStatus.IN_PROGRESS,
	};
	await dbController.addEvent(test_create_e2);

	const ticketHist = await dbController.getTicketHistory(t_create_parsed.ticket_id);
	console.log("> getTicketHistory");
	console.log(ticketHist);
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
