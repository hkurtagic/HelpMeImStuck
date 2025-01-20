import { sequelize } from "@backend/service/dbconnector.ts";
import { Model } from "sequelize";
import { ObjectUtils } from "./objectDiff.ts";
import { default as DepartmentModel } from "@backend/model/Department.ts";
import { default as ActionModel } from "@backend/model/Action.ts";
import { default as RoleModel, ServersideRoleModel } from "@backend/model/Role.ts";
import { default as UserModel, ServersideUserModel } from "@backend/model/User.ts";
import { default as StatusModel } from "@backend/model/Status.ts";
import { default as EventTypeModel } from "@backend/model/EventType.ts";
import { default as TicketModel, TicketModelExtended } from "@backend/model/Ticket.ts";
import { default as ImageModel } from "@backend/model/Image.ts";
import {
	SQLNoActionFound,
	SQLNoDepartmentFound,
	SQLNoRoleFound,
	SQLNoTicketFound,
	SQLNoUserFound,
} from "@backend/model/Errors.ts";
import { ServersideRole, ServersideUser } from "@backend/schemes_and_types/serverside_types.ts";
import {
	S_ServerDepartment,
	S_ServersideRole,
	S_ServersideUser,
} from "@backend/schemes_and_types/serverside_schemas.ts";

import {
	Actions,
	Department,
	DepartmentCreate,
	RoleCreate,
	TicketCreate,
	TicketStatus,
	UserCreate,
} from "@shared/shared_types.ts";

export const addUser = async (
	user: UserCreate,
): Promise<Model<ServersideUser> | null> => {
	const roles = [];
	for (const role of user.roles) {
		const r = await RoleModel.findByPk(role.role_id);
		if (!r) throw SQLNoRoleFound(role.role_id, role.role_name);
		roles.push(r);
	}
	const t = await sequelize.transaction();
	try {
		const u = await UserModel.create({
			user_name: user.user_name,
			password_hash: user.password,
		});
		await u.addRoles(roles);
		if (user.actions) {
			for (const action of user.actions) {
				const dbA = await ActionModel.findByPk(action);
				if (dbA) {
					await u.addAction(dbA);
				}
			}
		}
		await t.commit();
	} catch (error) {
		console.error(error);
		// If the execution reaches this line, an error was thrown.
		// We rollback the transaction.
		await t.rollback();
		return null;
	}
	const res = await UserModel.getUserByName(user.user_name);
	if (!res) throw SQLNoUserFound;
	return res;
};

export const getUser = async (
	search_param: { user_id?: string; user_name?: string },
): Promise<ServersideUserModel | null> => {
	let user = null;
	if (search_param.user_id) {
		user = await UserModel.getUserById(search_param.user_id);
	}
	if (search_param.user_name) {
		user = await UserModel.getUserByName(search_param.user_name);
	}
	if (!user) throw SQLNoUserFound(search_param.user_id, search_param.user_name);
	return user;
};

export const editUser = async (
	user: ServersideUser,
): Promise<ServersideUserModel | null> => {
	const t = await sequelize.transaction();
	try {
		const old_u = await getUser({ user_id: user.user_id });
		if (!old_u) throw SQLNoUserFound(user.user_id, user.user_name);
		const userDiff = ObjectUtils.diff(
			S_ServersideUser.parse(old_u),
			user,
			false,
		);
		const userRoleDiff = ObjectUtils.arrayDiff(
			S_ServersideUser.parse(old_u).roles.map((o) => o.role_id),
			user.roles.map((o) => o.role_id),
		);
		if (!userDiff) return null;
		console.log("!> userDiff:");
		console.log(userDiff);
		console.log("!> userRoleDiff:");
		console.log(userRoleDiff);
		// check if something added
		if (userDiff.added) {
			// add actions if needed
			if (Object.keys(userDiff.added).includes("actions")) {
				const added_actions = Object.values(
					(userDiff.added as { [propName: string]: unknown[] }).actions,
				) as Actions[];
				for (const action of added_actions) {
					await old_u.addAction(action, { transaction: t });
				}
			}
		}
		// check if somethin removed
		if (userDiff.removed) {
			// remove actions if needed
			if (Object.keys(userDiff.removed).includes("actions")) {
				const removed_actions = Object.values(
					(userDiff.removed as { [propName: string]: unknown[] }).actions,
				) as Actions[];
				for (const action of removed_actions) {
					await old_u.removeAction(action, { transaction: t });
				}
			}
		}
		if (userRoleDiff) {
			if (userRoleDiff.added) {
				for (const role_id of (userRoleDiff.added as number[])) {
					await old_u.addRole(role_id, { transaction: t });
				}
			}
			if (userRoleDiff.removed) {
				for (const role_id of (userRoleDiff.removed as number[])) {
					await old_u.addRole(role_id, { transaction: t });
				}
			}
		}

		await old_u.update(user, { transaction: t });
		await t.commit();
	} catch (error) {
		console.error(error);
		// If the execution reaches this line, an error was thrown.
		// We rollback the transaction.
		await t.rollback();
	}
	const res = await UserModel.getUserByName(user.user_name);
	if (!res) throw SQLNoUserFound;
	return res;
};

export const deleteUser = async (user: ServersideUser): Promise<boolean> => {
	const t = await sequelize.transaction();
	try {
		await UserModel.destroy({
			where: { pk_user_id: user.user_id },
			transaction: t,
		});

		await t.commit();
	} catch (error) {
		console.error(error);
		await t.rollback();
		return false;
	}
	return true;
};

export const addAction = async (
	action: string,
): Promise<ActionModel> => {
	return await ActionModel.create({
		action_name: action,
	});
};
// const editAction = async () => {};
// const deleteAction = async () => {};

export const addRole = async (
	role: RoleCreate,
): Promise<Model<ServersideRole>> => {
	const t = await sequelize.transaction();
	const d = await DepartmentModel.getDepartmentById(role.department.department_id);
	if (!d) throw SQLNoDepartmentFound;

	try {
		// create role
		const r = await RoleModel.create({
			role_name: role.role_name,
			role_description: role.role_description,
		}, { transaction: t });
		// assign new role to department
		await r.setDepartment(d, { transaction: t });
		// add actions to new role
		for (const action of role.actions) {
			const dbA = await ActionModel.findByPk(action);
			if (!dbA) throw SQLNoActionFound(action);
			await r.addAction(dbA, { transaction: t });
		}
		await t.commit();
	} catch (error) {
		console.error(error);
		// If the execution reaches this line, an error was thrown.
		// We rollback the transaction.
		await t.rollback();
	}

	const res = await RoleModel.getRoleByName(role.role_name, role.department.department_id);
	if (!res) throw SQLNoRoleFound(undefined, role.role_name);
	return res;
};

export const getRole = async (
	search_param: { role_id: number } | { role_name: string; department_id: number },
): Promise<ServersideRoleModel | null> => {
	let role = null;
	if ("role_id" in search_param) {
		role = await RoleModel.getRoleById(search_param.role_id);
		if (!role) throw SQLNoRoleFound(search_param.role_id, undefined);
	} else {
		role = await RoleModel.getRoleByName(search_param.role_name, search_param.department_id);
		if (!role) throw SQLNoRoleFound(undefined, search_param.role_name);
	}
	return role;
};

export const editRole = async (
	role: ServersideRole,
): Promise<Model<ServersideRole> | null> => {
	const t = await sequelize.transaction();
	try {
		const old_r = await RoleModel.getRoleById(role.role_id);
		if (!old_r) throw SQLNoRoleFound(role.role_id, role.role_name);
		console.log("> old role");
		console.log(S_ServersideRole.parse(old_r));

		const roleDiff = ObjectUtils.diff(
			S_ServersideRole.parse(old_r),
			role,
			false,
		);
		console.log("> diff role values:");
		console.log(roleDiff);
		if (!roleDiff) return null;
		// add actions if needed
		if (
			roleDiff.added &&
			Object.keys(roleDiff.added).includes("actions" satisfies keyof ServersideRole)
		) {
			const added_actions = Object.values(
				(roleDiff.added as { [propName: string]: unknown[] }).actions,
			) as Actions[];
			for (const action of added_actions) {
				await old_r.addAction(action, { transaction: t });
			}
		}
		// remove actions if needed
		if (
			roleDiff.removed &&
			Object.keys(roleDiff.removed).includes("actions" satisfies keyof ServersideRole)
		) {
			const removed_actions = Object.values(
				(roleDiff.removed as { [propName: string]: unknown[] }).actions,
			) as Actions[];
			for (const action of removed_actions) {
				await old_r.removeAction(action, { transaction: t });
			}
		}
		// update Role table if needed
		if (roleDiff.updated) {
			await old_r.update(roleDiff?.updated, { transaction: t });
		}
		await t.commit();
	} catch (error) {
		console.error(error);
		// If the execution reaches this line, an error was thrown.
		// We rollback the transaction.
		await t.rollback();
		return null;
	}

	const res = await RoleModel.getRoleById(role.role_id);
	if (!res) throw SQLNoRoleFound(role.role_id, role.role_name);
	return res;
};
export const deleteRole = async (
	role: ServersideRole,
): Promise<boolean> => {
	const t = await sequelize.transaction();
	try {
		await RoleModel.destroy({
			where: { pk_role_id: role.role_id },
			transaction: t,
		});

		await t.commit();
	} catch (error) {
		console.error(error);
		await t.rollback();
		return false;
	}
	return true;
};

export const addDepartment = async (
	department: DepartmentCreate,
): Promise<DepartmentModel> => {
	await DepartmentModel.create(department);
	const d = await DepartmentModel.getDepartmentByName(department.department_name);
	if (!d) throw SQLNoDepartmentFound(undefined, department.department_name);
	return d;
};
export const getDepartment = async (
	search_param: { department_id: number } | { department_name: string },
): Promise<DepartmentModel | null> => {
	let department = null;
	if ("department_id" in search_param) {
		department = await DepartmentModel.getDepartmentById(search_param.department_id);
		if (!department) throw SQLNoDepartmentFound(search_param.department_id, undefined);
	} else {
		department = await DepartmentModel.getDepartmentByName(search_param.department_name);
		if (!department) throw SQLNoRoleFound(undefined, search_param.department_name);
	}
	return department;
};
export const editDepartment = async (
	department: Department,
): Promise<DepartmentModel | null> => {
	const t = await sequelize.transaction();
	try {
		const old_d = await DepartmentModel.getDepartmentById(department.department_id);
		if (!old_d) {
			throw SQLNoDepartmentFound(department.department_id, department.department_name);
		}

		const deptDiff = ObjectUtils.diff(
			S_ServerDepartment.parse(old_d),
			department,
			false,
		);
		if (!deptDiff) return null;
		// update Department table if needed
		if (deptDiff.updated) {
			await old_d.update(deptDiff?.updated, { transaction: t });
		}
		await t.commit();
	} catch (error) {
		console.error(error);
		// If the execution reaches this line, an error was thrown.
		// We rollback the transaction.
		await t.rollback();
		return null;
	}

	const res = await DepartmentModel.getDepartmentById(department.department_id);
	if (!res) throw SQLNoDepartmentFound(department.department_id, department.department_name);
	return res;
};
export const deleteDepartment = async (
	department: Department,
): Promise<boolean> => {
	const t = await sequelize.transaction();
	try {
		await DepartmentModel.destroy({
			where: { pk_department_id: department.department_id },
			transaction: t,
		});

		await t.commit();
	} catch (error) {
		console.error(error);
		await t.rollback();
		return false;
	}
	return true;
};

export const addTicket = async (
	new_ticket: TicketCreate,
): Promise<TicketModelExtended | null> => {
	const t = await sequelize.transaction();
	let ticket = null;
	try {
		// check if departments exist
		const ticket_department_ids: number[] = [];
		for (const dept of (new_ticket.departments)) {
			const d = await DepartmentModel.getDepartmentById(dept.department_id);
			if (!d) throw SQLNoDepartmentFound(dept.department_id, dept.department_name);
			ticket_department_ids.push(d.toJSON().pk_department_id);
		}
		// check if user exists
		const u = await UserModel.findByPk(new_ticket.author.user_id);
		if (!u) throw SQLNoUserFound(new_ticket.author.user_id, new_ticket.author.user_name);
		// create ticket
		ticket = await TicketModel.create({
			ticket_title: new_ticket.ticket_title,
			ticket_description: new_ticket.ticket_description,
		}, { transaction: t });

		// assign ticket to department
		await ticket.setDepartments(ticket_department_ids, { transaction: t });
		// assign ticket to user
		await ticket.setAuthor(u, { transaction: t });
		await ticket.setStatus(TicketStatus.OPEN, { transaction: t });

		const image_ids: string[] = [];
		if (new_ticket.images) {
			for (const image of new_ticket.images) {
				image_ids.push(
					(await ImageModel.create({ image_content: image }, { transaction: t })).toJSON()
						.pk_image_id,
				);
			}
			await ticket.setImages(image_ids, { transaction: t });
		}
		await t.commit();
	} catch (error) {
		console.error(error);
		// If the execution reaches this line, an error was thrown.
		// We rollback the transaction.
		await t.rollback();
		return null;
	}

	const res = await TicketModel.getTicketById(ticket.toJSON().pk_ticket_id);
	if (!res) {
		throw SQLNoTicketFound(
			ticket.toJSON().pk_ticket_id,
			new_ticket.author.user_id,
			new_ticket.author.user_name,
		);
	}
	return res;
};
// const getTicket = async (
// 	ticket_id: string,
// ): Promise<TicketModel> => {
// };
// const getTickets = async (
// 	ticket: {author_id:string}|{department_id:number} ,
// ): Promise<TicketModel> => {
// };
const editTicket = async () => {};
const deleteTicket = async () => {};

export const addStatus = async (status: string) => {
	return await StatusModel.create({
		status_name: status,
	});
};
// const editStatus = async () => {};
// const deleteStatus = async () => {};

const addTag = async () => {};
const editTag = async () => {};
const deleteTag = async () => {};

const addEvent = async () => {};
const editEvent = async () => {};
const deleteEvent = async () => {};

export const addEventType = async (eventType: string) => {
	return await EventTypeModel.create({
		event_type_name: eventType,
	});
};
// const editEventType = async () => {};
// const deleteEventType = async () => {};

// const addUserToDepartment = async () => {};
// const removeUserFromDepartment = async () => {};
const addRoleToUser = async () => {};
const removeRoleFromUser = async () => {};
