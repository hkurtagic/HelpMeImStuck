import { z } from "zod";
import {
	S_Department,
	S_Role,
	S_User,
	UUID,
	zAction,
	zTicketStatus,
} from "@shared/shared_schemas.ts";
import {
	// DTOStatusSchema,
	S_DTOAction,
	S_DTODepartment,
	S_DTORoleParsed,
	S_DTOStatus,
	S_DTOUserExtendedParsed,
} from "./dto_objects.ts";

const S_Action = z.union([
	S_DTOAction,
	zAction.array(),
]);

const AllowedActions = z.object({
	actions: zAction.array(),
});
// predefined zAction sets
const RequesterActionPreset = AllowedActions.parse({
	actions: [
		zAction.enum.ticket_create,
		zAction.enum.ticket_pullBack,
		zAction.enum.ticket_closeOwn,
	],
});
const SupporterActionPreset = AllowedActions.parse({
	actions: [
		...RequesterActionPreset.actions,
		zAction.enum.ticket_seeDepartmentTickets,
		zAction.enum.ticket_accept,
		zAction.enum.ticket_close,
		zAction.enum.ticket_forward,
		zAction.enum.ticket_addDepartment,
		zAction.enum.ticket_addTag,
		zAction.enum.ticket_removeTag,
	],
});
const AdminActionPreset = AllowedActions.parse({
	actions: [
		...SupporterActionPreset.actions,
		...Object.values(zAction).filter((a) => {
			if (typeof a === "number" && !SupporterActionPreset.actions.includes(a)) return a;
			return;
		}),
	],
});

const S_ServerDepartment = z.union([
	S_DTODepartment.transform(({ pk_department_id, ...rest }) => {
		return {
			department_id: pk_department_id,
			...rest,
		};
	}).readonly(),
	S_Department,
]);

const S_RoleExtended = S_Role.extend({
	actions: zAction.array(),
});

const S_ServersideRole = z.union([S_RoleExtended, S_DTORoleParsed]);

const S_ServersideUser = z.union([
	S_DTOUserExtendedParsed,
	S_User.omit({
		roles: true,
	}).extend({
		password: z.string(),
		roles: S_ServersideRole.array(),
		actions: zAction.array().optional().nullable(),
	}),
]);

const S_StatusServer = z.union([
	S_DTOStatus.transform(({ pk_status_id, ..._ }) => {
		return pk_status_id;
	}),
	zTicketStatus.array(),
]);

const JWTExtraPayload = z.object({
	user_id: UUID,
});
const JWTPayload = JWTExtraPayload.extend({
	iat: z.number(),
	exp: z.number(),
});

export {
	AdminActionPreset,
	JWTExtraPayload,
	JWTPayload,
	RequesterActionPreset,
	S_Action,
	S_ServerDepartment,
	S_ServersideRole,
	S_ServersideUser,
	S_StatusServer,
	SupporterActionPreset,
};
