import { sequelize } from "@backend/service/dbconnector.ts";
import UserModel from "@backend/model/User.ts";
import RoleModel from "@backend/model/Role.ts";
import ActionModel from "@backend/model/Action.ts";
import DepartmentModel from "@backend/model/Department.ts";
import {
	SQLNoActionFound,
	SQLNoDepartmentFound,
	SQLNoRoleFound,
	SQLNoUserFound,
} from "@backend/model/Errors.ts";
import { ServersideRole, ServersideUser } from "@backend/schemes_and_types/serverside_types.ts";

import { Actions, DepartmentCreate, RoleCreate, UserCreate } from "@shared/shared_types.ts";
import { Model } from "sequelize";
import { ObjectUtils } from "./objectDiff.ts";
import { S_ServersideRole } from "@backend/schemes_and_types/serverside_schemas.ts";

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
	user_options: { user_id?: string; user_name?: string },
): Promise<Model<ServersideUser> | null> => {
	let user = null;
	if (user_options.user_id) {
		user = await UserModel.getUserById(user_options.user_id);
	}
	if (user_options.user_name) {
		user = await UserModel.getUserByName(user_options.user_name);
	}
	if (!user) throw SQLNoUserFound(user_options.user_id, user_options.user_name);
	return user;
};

// export const editUser = async (
// 	user: User,
// ): Promise<Model<ServersideUser>> => {
// 	const t = await sequelize.transaction();
// 	const u = await getUser(user.user_id);
// 	if (!u) throw SQLNoUserFound(user.user_id, user.user_name);
// 	try {
// 		// Then, we do some calls passing this transaction as an option:
// 		await u.update(user, { transaction: t });
// 		// If the execution reaches this line, no errors were thrown.
// 		// We commit the transaction.
// 		await t.commit();
// 	} catch (error) {
// 		console.error(error);
// 		// If the execution reaches this line, an error was thrown.
// 		// We rollback the transaction.
// 		await t.rollback();
// 	}
// 	const res = await UserModel.getUserByName(user.user_name);
// 	if (!res) throw SQLNoUserFound;
// 	return res;
// };

export const deleteUser = async (user: ServersideUser): Promise<number | null> => {
	let del_user_amount = null;
	try {
		del_user_amount = await UserModel.destroy({
			where: { pk_user_id: user.user_id },
		});
	} catch (e) {
		console.error(e);
	}
	if (!del_user_amount) return null;
	return del_user_amount;
};

export const addAction = async (
	action: Actions,
): Promise<ActionModel> => {
	return await ActionModel.create({
		action_name: action.toString(),
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
export const editRole = async (
	role: ServersideRole,
): Promise<Model<ServersideRole> | null> => {
	const t = await sequelize.transaction();
	try {
		const old_r = await RoleModel.getRoleById(role.role_id);
		const old_rModel = await RoleModel.findByPk(role.role_id);
		if (!old_r) throw SQLNoRoleFound(role.role_id, role.role_name);
		if (!old_rModel) throw SQLNoRoleFound(role.role_id, role.role_name);
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
				await old_rModel.addAction(action, { transaction: t });
			}
		}
		// remove actions if needed
		if (
			roleDiff.removed &&
			Object.keys(roleDiff.removed).includes("actions" satisfies keyof ServersideRole)
		) {
			const removed_actions = Object.values(
				(roleDiff.added as { [propName: string]: unknown[] }).actions,
			) as Actions[];
			for (const action of removed_actions) {
				await old_rModel.removeAction(action, { transaction: t });
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
	}

	const res = await RoleModel.getRoleByName(role.role_name, role.department.department_id);
	if (!res) throw SQLNoRoleFound(undefined, role.role_name);
	return res;
};
const deleteRole = async () => {};

export const addDepartment = async (
	department: DepartmentCreate,
): Promise<DepartmentModel> => {
	await DepartmentModel.create(department);
	const d = await DepartmentModel.getDepartmentByName(department.department_name);
	if (!d) throw SQLNoDepartmentFound(undefined, department.department_name);
	return d;
};
const editDepartment = async () => {};
const deleteDepartment = async () => {};

const addTicket = async () => {};
const editTicket = async () => {};
const deleteTicket = async () => {};

const addStatus = async () => {};
const editStatus = async () => {};
const deleteStatus = async () => {};

const addTag = async () => {};
const editTag = async () => {};
const deleteTag = async () => {};

const addEvent = async () => {};
const editEvent = async () => {};
const deleteEvent = async () => {};

const addEventType = async () => {};
const editEventType = async () => {};
const deleteEventType = async () => {};

const addUserToDepartment = async () => {};
const removeUserFromDepartment = async () => {};
const addRoleToUser = async () => {};
const removeRoleFromUser = async () => {};
