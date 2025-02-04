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
    S_ServerDepartment,
    S_ServersideRole,
    S_ServerTicket,
} from "@backend/schemes_and_types/serverside_schemas.ts";
import * as dbController from "./dbController.ts";
import { ServersideRole } from "@backend/schemes_and_types/serverside_types.ts";
import {
    AdminActionPreset,
    RequesterActionPreset,
    S_UserAdmin,
    SupporterActionPreset,
} from "@shared/shared_schemas.ts";
import { TagCreate } from "@shared/shared_types.ts";
import { default as TagModel } from "../model/Tag.ts";

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
    const admin_department = await dbController.addDepartment(new_d);

    const new_r: RoleCreate = {
        role_name: "Administrator",
        role_description: "Administrator role",
        department: S_ServerDepartment.parse(admin_department.toJSON()),
        actions: AdminActionPreset.actions,
    };

    await dbController.addRole(new_r);
    const admin_role = (await dbController.getRole({
        role_name: new_r.role_name,
        department_id: new_r.department.department_id,
    }))!;
    // const parsed_r = S_ServersideRole.parse(admin_role!.toJSON());
    const new_u: UserCreate = {
        user_name: "Administrator",
        password: "admin",
        roles: [admin_role],
        // actions: SupporterActionPreset.actions,
    };
    await dbController.addUser(new_u);

    // #endregion Admin

    const ITDepartment: DepartmentCreate = {
        department_name: "IT Department",
        department_description: "The IT Nannies",
    };

    const FinanceDepartment: DepartmentCreate = {
        department_name: "Finance Department",
        department_description: "GRAB THAT MONEE",
    };
    const itDept = S_ServerDepartment.parse(
        (await dbController.addDepartment(ITDepartment)).toJSON(),
    );
    const financeDept = S_ServerDepartment.parse(
        (await dbController.addDepartment(FinanceDepartment)).toJSON(),
    );
    const depts = [itDept, financeDept];

    for (const d of depts) {
        const Requester: RoleCreate = {
            role_name: "Requester",
            role_description: "Requester role of " + d.department_name,
            department: d,
            actions: RequesterActionPreset.actions,
        };
        const Supporter: RoleCreate = {
            role_name: "Supporter",
            role_description: "Supporter role of " + d.department_name,
            department: d,
            actions: SupporterActionPreset.actions,
        };
        // const Manager: RoleCreate = {
        // 	role_name: "Manager",
        // 	role_description: "Manager role of " + d.department_name,
        // 	department: d,
        // 	actions: ManagerActionPreset.actions,
        // };
        await dbController.addRole(Requester);
        await dbController.addRole(Supporter);
        // await dbController.addRole(Manager);
    }
    const itRoles = await dbController.getAllRolesInDepartment(itDept.department_id);
    const financeRoles = await dbController.getAllRolesInDepartment(financeDept.department_id);
    const user1_create: UserCreate = {
        user_name: "User1",
        password: "test",
        // supporter of IT and manager of Finance
        roles: [itRoles[1], financeRoles[0]],
        // actions: SupporterActionPreset.actions,
    };
    const user2_create: UserCreate = {
        user_name: "User2",
        password: "test",
        // Requester
        roles: [itRoles[0]],
        // actions: SupporterActionPreset.actions,
    };
    const user3_create: UserCreate = {
        user_name: "User3",
        password: "test",
        // supporter of finance
        roles: [financeRoles[1]],
        // actions: SupporterActionPreset.actions,
    };
    console.log(user1_create);
    console.log(user2_create);
    console.log(user3_create);
    await dbController.addUser(user1_create);
    await dbController.addUser(user2_create);
    await dbController.addUser(user3_create);
    await setAdminEnv();
    // await _testDB();
}
export async function setAdminEnv() {
    const admin_department =
        (await dbController.getDepartment({ department_name: "System Administration" }))!;
    const admin_role = (await dbController.getRole({
        role_name: "Administrator",
        department_id: admin_department.department_id,
    }))!;
    const admin_user = (await dbController.getUser({ user_name: "Administrator" }))!;
    Deno.env.set(
        "ADMIN_DEPARTMENT_ID",
        admin_department.department_id.toString(),
    );
    Deno.env.set("ADMIN_ROLE_ID", admin_role.role_id.toString());
    Deno.env.set("ADMIN_USER_ID", admin_user.user_id);
}

async function _testDB() {
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
    const r_create = (await dbController.getRole({
        role_name: test_create_r.role_name,
        department_id: test_create_r.department.department_id,
    }))!;
    // const r_create_parsed = S_ServersideRole.parse(r_create!.toJSON());

    // test user creation
    const test_create_u: UserCreate = {
        user_name: "ITsupporter",
        password: "test",
        roles: [r_create],
        // actions: SupporterActionPreset.actions,
    };
    await dbController.addUser(test_create_u);
    const u_create = (await dbController.getUser({ user_name: test_create_u.user_name }))!;
    // const u_create_parsed = S_ServersideUser.parse(u_create?.toJSON());

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
        role_id: r_create.role_id,
        role_name: "IT requester",
        role_description: "IT requester role",
        department: r_create.department,
        actions: RequesterActionPreset.actions,
    };
    console.log("> old role: " + JSON.stringify(r_create));
    const r_update = await dbController.editRole(test_update_r);
    const r_update_parsed = S_ServersideRole.parse(r_update!.toJSON());
    console.log("updated role: " + JSON.stringify(r_update_parsed));

    const d2 = (await dbController.getDepartment({ department_name: "System Administration" }))!;
    const r2 = (await dbController.getRole({
        role_name: "Administrator",
        department_id: d2.department_id,
    }))!;
    // const r2_parsed = S_ServersideRole.parse(r2!.toJSON());
    // test user update
    const test_update_u: UserAdmin = {
        user_id: u_create.user_id,
        user_name: "ITsupporter",
        password: u_create.password,
        roles: [r_create, r2],
        actions: SupporterActionPreset.actions,
    };
    console.log("> old user: " + JSON.stringify(u_create));
    const u_update = (await dbController.editUser(S_UserAdmin.parse(test_update_u)))!;
    // const u_update_parsed = S_ServersideUser.parse(u_update!.toJSON());
    console.log("updated user: " + JSON.stringify(u_update));
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
    const test_create_tag: TagCreate = {
        tag_name: "Tier 1 Support",
        tag_abbreviation: "T1",
        department: r_create.department,
    };
    await dbController.addTag(test_create_tag);

    let test_update_tag = await TagModel.getTagByName(
        test_create_tag.tag_name,
        test_create_tag.department.department_id,
    );

    test_update_tag = { ...test_update_tag!, tag_name: "Tier 2 Support", tag_abbreviation: "T2" };
    await dbController.editTag(test_update_tag);
    // await dbController.deleteTag(test_update_tag.tag_id);

    // test_ticket
    const test_create_t: TicketCreate = {
        author: { user_id: u_update.user_id, user_name: u_update.user_name },
        departments: [d_update_parsed],
        ticket_title: "test_ticket",
        ticket_description: "ticket description",
    };

    console.info("> new ticket: " + JSON.stringify(test_create_t));
    (await dbController.addTicket(test_create_t))!;
    const user_t_create = await dbController.getAllTicketsOf({
        author_id: u_update.user_id,
    });
    const t_create = user_t_create[user_t_create.length - 1];
    const t_create_parsed = t_create;
    console.info("> created ticket: " + JSON.stringify(t_create_parsed));

    const tag_on_ticket = await dbController.addTagToTicket(
        t_create_parsed.ticket_id,
        test_update_tag.tag_id,
    );
    console.log("> tag added to ticket? " + tag_on_ticket);

    const t_all_of_user = await dbController.getAllTicketsOf({
        author_id: test_create_t.author.user_id,
    });
    console.info(
        "> all tickets of " + test_create_t.author.user_name + ": " +
            JSON.stringify(t_all_of_user),
    );
    // test add event
    const test_create_e: TicketEvent = {
        author: t_create_parsed.author,
        ticket_id: t_create_parsed.ticket_id,
        // created_at: t_create.toJSON().created_at,
        event_type: EventType.statusChange,
        new_status: TicketStatus.OPEN,
        description: t_create_parsed.departments[0].department_id.toString(),
    };
    await dbController.addEvent(test_create_e);
    const u_create_e2 = (await dbController.getUser({ user_name: "Administrator" }))!;
    console.log("> second ticket event user:");
    console.log({ user_id: u_create_e2.user_id, user_name: u_create_e2.user_name });
    // test add event
    /*const test_create_e: TicketEvent = {
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
	console.log(ticketHist);*/
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
