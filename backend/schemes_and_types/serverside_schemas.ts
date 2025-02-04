import { z } from "zod";
import {
    S_Department,
    S_RoleAdmin,
    S_Ticket,
    S_UserAdmin,
    UUID,
    zAction,
    zEventType,
    zTicketStatus,
} from "@shared/shared_schemas.ts";
import {
    S_DTOAction,
    S_DTODepartment,
    S_DTOEventType,
    S_DTORoleParsed,
    S_DTOStatus,
    S_DTOTicketExtendedParsed,
    S_DTOUserExtendedParsed,
} from "./dto_objects.ts";
import { Actions } from "@shared/shared_types.ts";

const S_Action = z.union([
    S_DTOAction,
    zAction.array(),
]);

const S_ServerDepartment = z.union([
    S_DTODepartment.transform(({ pk_department_id, ...rest }) => {
        return {
            department_id: pk_department_id,
            ...rest,
        };
    }).readonly(),
    S_Department,
]);

// const S_RoleExtended = S_Role.extend({
// 	actions: zAction.array(),
// });

const S_ServersideRole = z.union([S_RoleAdmin, S_DTORoleParsed]);

const S_ServersideUser = z.union([
    S_DTOUserExtendedParsed,
    S_UserAdmin,
    // S_User.omit({
    // 	roles: true,
    // }).extend({
    // 	password: z.string(),
    // 	roles: S_ServersideRole.array(),
    // 	actions: zAction.array().optional().nullable(),
    // }),
]);

const S_ActionsPerDepartment = S_UserAdmin.transform(({ roles }) => {
    return roles.reduce<Record<number, Actions[]>>((res, { department, actions }) => {
        const deptId = department.department_id;
        if (res[deptId]) {
            res[deptId].push(...actions);
        } else {
            res[deptId] = actions;
        }
        return res;
    }, {});
});

const S_ServerStatus = z.union([
    S_DTOStatus.transform(({ pk_status_id, ..._ }) => {
        return pk_status_id;
    }),
    zTicketStatus.array(),
]);

const S_ServerEventType = z.union([
    S_DTOEventType.transform(({ pk_event_type_id, ..._ }) => {
        return pk_event_type_id;
    }),
    zEventType.array(),
]);

const S_ServerTicket = z.union([
    S_DTOTicketExtendedParsed,
    S_Ticket,
]);

const JWTExtraPayload = z.object({
    user_id: UUID,
});
const JWTPayload = JWTExtraPayload.extend({
    iat: z.number(),
    exp: z.number(),
});
export {
    // AdminActionPreset,
    JWTExtraPayload,
    JWTPayload,
    // ManagerActionPreset,
    // RequesterActionPreset,
    S_Action,
    // SupporterActionPreset,
    S_ActionsPerDepartment,
    S_ServerDepartment,
    S_ServerEventType,
    S_ServersideRole,
    S_ServersideUser,
    S_ServerStatus,
    S_ServerTicket,
};
