import { sequelize } from "@backend/service/dbconnector.ts";
import { Model } from "sequelize";
import { ObjectUtils } from "./objectDiff.ts";
import { default as DepartmentModel } from "@backend/model/Department.ts";
import { default as TagModel } from "@backend/model/Tag.ts";
import { default as ActionModel } from "@backend/model/Action.ts";
import { default as RoleModel, ServersideRoleModel } from "@backend/model/Role.ts";
import { default as UserModel, ServersideUserModel } from "@backend/model/User.ts";
import { default as StatusModel } from "@backend/model/Status.ts";
import { default as EventTypeModel } from "@backend/model/EventType.ts";
import { default as EventModel } from "@backend/model/Event.ts";
import { default as TicketModel, ServerTicketModel } from "@backend/model/Ticket.ts";
import { default as ImageModel } from "@backend/model/Image.ts";
import {
    SQLNoActionFound,
    SQLNoDepartmentFound,
    SQLNoEventType,
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
    EventType,
    ID,
    Role,
    RoleCreate,
    TicketCreate,
    TicketEvent,
    TicketHistory,
    TicketStatus,
    User,
    UserAdmin,
    UserCreate,
    UUID,
} from "@shared/shared_types.ts";
import {
    S_DTORoleParsed,
    S_DTOUserExtendedParsed,
} from "@backend/schemes_and_types/dto_objects.ts";
import { Tag, TagCreate } from "../../shared/shared_types.ts";
import { S_DTOTagParsed } from "../schemes_and_types/dto_objects.ts";
import { SQLNoTagFound } from "../model/Errors.ts";

export const addUser = async (
    user: UserCreate,
): Promise<boolean> => {
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
        }, { transaction: t });
        await u.addRoles(roles, { transaction: t });
        if (user.actions) {
            const a_id = [];
            for (const action of user.actions) {
                const dbA = await ActionModel.findByPk(action);
                if (dbA) {
                    // await u.addAction(dbA, { transaction: t });
                    a_id.push(dbA.toJSON().pk_action_id);
                }
            }
            await u.setActions(a_id, { transaction: t });
        }
        await t.commit();
    } catch (error) {
        console.error(error);
        // If the execution reaches this line, an error was thrown.
        // We rollback the transaction.
        await t.rollback();
        return false;
    }
    // const res = await UserModel.getUserByName(user.user_name);
    // if (!res) throw SQLNoUserFound;
    return true;
};

export const getUser = async (
    search_param: { user_id: UUID } | { user_name: string },
): Promise<ServersideUserModel | null> => {
    let user = null;
    if ("user_id" in search_param) {
        user = await UserModel.getUserById(search_param.user_id);
        if (!user) throw SQLNoUserFound(search_param.user_id, undefined);
    } else {
        user = await UserModel.getUserByName(search_param.user_name);
        if (!user) throw SQLNoUserFound(undefined, search_param.user_name);
    }
    return user;
};

export const getAllUsersInDepartment = async (
    department_id: ID,
): Promise<ServersideUser[]> => {
    const users = await UserModel.findAll({
        include: [
            {
                model: RoleModel,
                as: "roles",
                required: true,
                include: [{
                    model: DepartmentModel,
                    as: "department",
                    required: true,

                    where: { pk_department_id: department_id },
                }, {
                    model: ActionModel,
                    as: "actions",
                    through: {
                        attributes: [],
                    },
                }],
                through: {
                    attributes: [],
                },
            },
            {
                model: ActionModel,
                as: "actions",
                through: {
                    attributes: [],
                },
            },
        ],
    }) as unknown as ServersideUserModel[];
    if (!users) return [];
    const parsed_users: ServersideUser[] = [];
    users.forEach((user) => parsed_users.push(S_DTOUserExtendedParsed.parse(user.toJSON())));
    return parsed_users;
};

export const editUser = async (
    user: UserAdmin,
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
            // remove actions if needed only if user was sent with actions
            if (Object.keys(userDiff.removed).includes("actions") && user.actions) {
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

        await old_u.update(userDiff.updated as UserAdmin, { transaction: t });
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

export const deleteUser = async (user_id: UUID): Promise<boolean> => {
    const t = await sequelize.transaction();
    try {
        await UserModel.destroy({
            where: { pk_user_id: user_id },
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
): Promise<boolean> => {
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
        return false;
    }
    return true;
};

export const getRole = async (
    search_param: { role_id: ID } | { role_name: string; department_id: ID },
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
export const getAllRolesInDepartment = async (
    department_id: ID,
): Promise<ServersideRole[]> => {
    const roles = await RoleModel.findAll({
        include: [{
            model: DepartmentModel,
            as: "department",
            where: {
                pk_department_id: department_id,
            },
            required: true,
        }, {
            model: ActionModel,
            as: "actions",
            required: true,
            through: {
                attributes: [],
            },
        }],
    });
    if (!roles) return [];
    const parsed_roles: ServersideRole[] = [];
    roles.forEach((roles) => parsed_roles.push(S_DTORoleParsed.parse(roles.toJSON())));
    return parsed_roles;
};

export const editRole = async (
    role: Role,
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
    role_id: ID,
): Promise<boolean> => {
    const t = await sequelize.transaction();
    try {
        await RoleModel.destroy({
            where: { pk_role_id: role_id },
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
    search_param: { department_id: ID } | { department_name: string },
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
export const getAllDepartments = async (): Promise<Department[]> => {
    const departments = await DepartmentModel.findAll();
    if (!departments) return [];
    const parsed_departments = departments.map((d) => {
        return S_ServerDepartment.parse(d);
    });
    return parsed_departments as Department[];
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
    department_id: ID,
): Promise<boolean> => {
    const t = await sequelize.transaction();
    try {
        await DepartmentModel.destroy({
            where: { pk_department_id: department_id },
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
): Promise<boolean> => {
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
        return false;
    }

    // const res = await TicketModel.getTicketById(ticket.toJSON().pk_ticket_id);
    // if (!res) {
    // 	throw SQLNoTicketFound(
    // 		ticket.toJSON().pk_ticket_id,
    // 		new_ticket.author.user_id,
    // 		new_ticket.author.user_name,
    // 	);
    // }
    return true;
};
export const getTicket = async (
    ticket_id: UUID,
): Promise<ServerTicketModel> => {
    const res = await TicketModel.getTicketById(ticket_id);
    if (!res) {
        throw SQLNoTicketFound(
            ticket_id,
        );
    }
    return res;
};
export const getAllTicketsOf = async (
    search_for: { author_id: UUID } | { department_id: ID },
): Promise<ServerTicketModel[]> => {
    let ticket_ids = [];
    if ("author_id" in search_for) {
        ticket_ids = (await TicketModel.findAll({
            include: [{
                model: UserModel,
                as: "author",
                // required: true,
                attributes: ["pk_user_id"],
                where: {
                    pk_user_id: search_for.author_id,
                },
            }],
        })).map((o) => (o.toJSON()).pk_ticket_id);
    } else {
        ticket_ids = (await TicketModel.findAll({
            include: [{
                model: DepartmentModel,
                as: "departments",
                // required: true,
                attributes: ["pk_department_id"],
                where: {
                    pk_department_id: search_for.department_id,
                },
            }],
        })).map((o) => (o.toJSON()).pk_ticket_id);
    }
    if (!ticket_ids.length) return [];
    const res = [];
    for (const id of ticket_ids) {
        res.push((await TicketModel.getTicketById(id))!);
    }
    return res;
};
// const editTicket = async () => {};
export const deleteTicket = async (
    ticket_id: UUID,
): Promise<boolean> => {
    const t = await sequelize.transaction();
    try {
        await TicketModel.destroy({
            where: { pk_ticket_id: ticket_id },
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
export const addStatus = async (status: string) => {
    return await StatusModel.create({
        status_name: status,
    });
};
// const editStatus = async () => {};
// const deleteStatus = async () => {};

export const addTag = async (new_tag: TagCreate): Promise<boolean> => {
    const t = await sequelize.transaction();
    try {
        const dept = new_tag.department;
        const department_id = await DepartmentModel.getDepartmentById(
            dept.department_id,
        );
        if (!department_id) throw SQLNoDepartmentFound(dept.department_id, dept.department_name);
        const tag = await TagModel.create({
            tag_name: new_tag.tag_name,
            tag_abbreviation: new_tag.tag_abbreviation,
        }, { transaction: t });
        if (new_tag.tag_description) tag.set("tag_description", new_tag.tag_description);
        if (new_tag.tag_style) tag.set("tag_style", new_tag.tag_style);
        await tag.setDepartment(department_id, { transaction: t });
        t.commit();
        return true;
    } catch (error) {
        console.error(error);
        // If the execution reaches this line, an error was thrown.
        // We rollback the transaction.
        await t.rollback();
        return false;
    }
};
export const editTag = async (
    tag: Tag,
): Promise<Tag | null> => {
    const t = await sequelize.transaction();
    try {
        const old_tag = await TagModel.findByPk(tag.tag_id, {
            transaction: t,
            include: [{ model: DepartmentModel }],
        });
        if (!old_tag) {
            throw SQLNoDepartmentFound(tag.tag_id, tag.tag_name);
        }

        const tagDiff = ObjectUtils.diff(
            S_DTOTagParsed.parse(old_tag),
            tag,
            false,
        );
        if (!tagDiff) return null;
        // update Department table if needed
        if (tagDiff.updated) {
            await old_tag.update(tagDiff?.updated, { transaction: t });
        }
        await t.commit();
    } catch (error) {
        console.error(error);
        // If the execution reaches this line, an error was thrown.
        // We rollback the transaction.
        await t.rollback();
        return null;
    }

    const res = await TagModel.getTagById(tag.tag_id);
    if (!res) throw SQLNoDepartmentFound(tag.tag_id, tag.tag_name);
    return res;
};
export const deleteTag = async (tag_id: number): Promise<boolean> => {
    const t = await sequelize.transaction();
    try {
        await TagModel.destroy({
            where: { pk_tag_id: tag_id },
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

export const addEvent = async (
    new_event: TicketEvent,
): Promise<boolean> => {
    const t = await sequelize.transaction();
    try {
        let e = null;
        switch (new_event.event_type) {
            case EventType.createTicket:
                e = await EventModel.create({ event_content: "" }, { transaction: t });
                await e.setEventType(EventType.createTicket, { transaction: t });
                await e.setAuthor(new_event.author.user_id, { transaction: t });
                await e.setTicket(new_event.ticket_id, { transaction: t });
                break;
            case EventType.statusChange:
                e = await EventModel.create({ event_content: new_event.new_status.toString() }, {
                    transaction: t,
                });
                await e.setEventType(EventType.statusChange, { transaction: t });
                await TicketModel.findByPk(new_event.ticket_id, { transaction: t })
                    .then((ticket) => ticket?.setStatus(new_event.new_status, { transaction: t }));
                break;
            case EventType.departmentAdded:
                e = await EventModel.create({ event_content: new_event.department_id.toString() }, {
                    transaction: t,
                });
                await e.setEventType(EventType.departmentForwarded, { transaction: t });
                await TicketModel.findByPk(new_event.ticket_id, { transaction: t })
                    .then((ticket) =>
                        ticket?.addDepartment(new_event.department_id, { transaction: t })
                    );
                break;
            case EventType.departmentForwarded:
                e = await EventModel.create({ event_content: new_event.department_id.toString() }, {
                    transaction: t,
                });
                await e.setEventType(EventType.departmentForwarded, { transaction: t });
                await TicketModel.findByPk(new_event.ticket_id, { transaction: t })
                    .then((ticket) =>
                        ticket?.setDepartments([new_event.department_id], { transaction: t })
                    );
                break;
            case EventType.comment:
                e = await EventModel.create({ event_content: new_event.comment }, {
                    transaction: t,
                });
                if (new_event.images) {
                    const image_ids = [];
                    for (const i of new_event.images) {
                        // push each image to DB and svae its id
                        image_ids.push(
                            (await ImageModel.create({ image_content: i }, { transaction: t }))
                                .toJSON().pk_image_id,
                        );
                    }
                    // link images to event
                    await e.setImages(image_ids, { transaction: t });
                }
                break;
        }
        await e.setAuthor(new_event.author.user_id, { transaction: t });
        await e.setTicket(new_event.ticket_id, { transaction: t });
        await t.commit();
    } catch (error) {
        console.error(error);
        // If the execution reaches this line, an error was thrown.
        // We rollback the transaction.
        await t.rollback();
        return false;
    }

    return true;
};
// const editEvent = async () => {};
// const deleteEvent = async () => {};
export const getTicketHistory = async (ticket_id: UUID): Promise<TicketHistory | null> => {
    // const t = await sequelize.transaction();
    const e = await EventModel.getTicketHistory(ticket_id);
    return e;
};

export const addEventType = async (eventType: string) => {
    return await EventTypeModel.create({
        event_type_name: eventType,
    });
};
// const editEventType = async () => {};
// const deleteEventType = async () => {};

// const addUserToDepartment = async () => {};
// const removeUserFromDepartment = async () => {};
// const addRoleToUser = async () => {};
// const removeRoleFromUser = async () => {};
