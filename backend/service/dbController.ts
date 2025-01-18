import User from "@backend/model/User.ts";
import Role from "@backend/model/Role.ts";
import Action from "@backend/model/Action.ts";
import Department from "@backend/model/Department.ts";
import {
	SQLNoActionFound,
	SQLNoDepartmentFound,
	SQLNoRoleFound,
	SQLNoUserFound,
} from "@backend/model/Errors.ts";
import { ServersideRole, ServersideUser } from "@backend/schemes_and_types/serverside_types.ts";

import { Actions, DepartmentCreate, RoleCreate, UserCreate } from "@shared/shared_types.ts";
import { Model } from "sequelize";

export const addUser = async (
	user: UserCreate,
): Promise<Model<ServersideUser> | null> => {
	const roles = [];
	for (const role of user.roles) {
		const r = await Role.findByPk(role.role_id);
		if (!r) throw SQLNoRoleFound(role.role_id, role.role_name);
		roles.push(r);
	}
	const u = await User.create({ user_name: user.user_name, password_hash: user.password });
	await u.addRoles(roles);
	if (user.actions) {
		for (const action of user.actions) {
			const dbA = await Action.findByPk(action);
			if (dbA) {
				await u.addAction(dbA);
			}
		}
	}
	const res = await User.getUserByName(user.user_name);
	if (res === null) throw SQLNoUserFound;
	return res;
};

export const getUser = async (
	user_id?: string,
	user_name?: string,
): Promise<Model<ServersideUser> | null> => {
	let user = null;
	if (user_id) {
		user = await User.getUserById(user_id);
	}
	if (user_name) {
		user = await User.getUserByName(user_name);
	}
	if (!user) throw SQLNoUserFound(user_id, user_name);
	return user;
};

export const editUser = async (
	user: User,
	roles?: Role[] | string[],
): Promise<User> => {
	if (roles) {
		for (let count: number = 0; count < roles.length; count++) {
			if (typeof roles[count] === "string") {
				const s_role = await Role.findOne({
					where: { role_name: roles[count] },
				});
				if (s_role == null) throw SQLNoRoleFound;
				roles[count] = s_role;
			}
			//@ts-expect-error: <IDE does not like sequelize magic>
			await user.setRoles(roles);
		}
	}
	return await user.update(user);
};

export const deleteUser = async (user: User | string) => {
	try {
		if (typeof user === "string") {
			const s_user = await User.findOne({
				where: {
					user_name: user,
				},
			});
			if (s_user == null) return null;
			user = s_user;
		}
		return await User.destroy({
			where: { pk_user_id: user.pk_user_id },
		});
	} catch (e) {
		console.log(e);
	}
};

export const addAction = async (
	action: Actions,
): Promise<Action> => {
	return await Action.create({
		action_name: action.toString(),
	});
};
const editAction = async () => {};
const deleteAction = async () => {};

export const addRole = async (
	role: RoleCreate,
): Promise<Model<ServersideRole>> => {
	const d = await Department.getDepartmentById(role.department.department_id);
	if (!d) throw SQLNoDepartmentFound;
	// create role
	const r = await Role.create({
		role_name: role.role_name,
		role_description: role.role_description,
	});
	// assign new role to department
	await r.setDepartment(d);
	// add actions to new role
	for (const action of role.actions) {
		const dbA = await Action.findByPk(action);
		if (!dbA) throw SQLNoActionFound(action);
		await r.addAction(dbA);
	}
	const res = await Role.getRoleByName(role.role_name, role.department.department_id);
	if (!res) throw SQLNoRoleFound(undefined, role.role_name);
	return res;
};
const editRole = async () => {};
const deleteRole = async () => {};

export const addDepartment = async (
	department: DepartmentCreate,
): Promise<Department> => {
	await Department.create(department);
	const d = await Department.getDepartmentByName(department.department_name);
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
