import { z } from "zod";
import { Actions as AllActions, TicketStatus } from "@shared/shared_types.ts";
import { RoleScheme, UserScheme, UUID } from "@shared/shared_schemas.ts";
const Action = z.nativeEnum(AllActions);
const stat = z.nativeEnum(TicketStatus);

// const StatusSchema = z.preprocess(unknownObjLayout =>{

// }).object({
// 	status_id: z.number().nonnegative(),
// 	status_name: stat
// }).setKey((data) => {
// 	if (data.pk_status_id) {}})

const AllowedActions = z.object({
	actions: Action.array(),
});
// predefined Action sets
const RequesterActionPreset = AllowedActions.parse({
	actions: [Action.enum.ticket_create, Action.enum.ticket_pullBack, Action.enum.ticket_pullBack],
});
const SupporterActionPreset = AllowedActions.parse({
	actions: [
		...RequesterActionPreset.actions,
		Action.enum.ticket_seeDepartmentTickets,
		Action.enum.ticket_accept,
		Action.enum.ticket_close,
		Action.enum.ticket_forward,
		Action.enum.ticket_addDepartment,
		Action.enum.ticket_addTag,
		Action.enum.ticket_removeTag,
	],
});
const AdminActionPreset = AllowedActions.parse({
	actions: [
		...SupporterActionPreset.actions,
		...Object.values(Action).filter((a) => {
			if (typeof a === "number" && !SupporterActionPreset.actions.includes(a)) return a;
			return;
		}),
	],
});

const ServersideRoleSchema = RoleScheme.extend({
	actions: Action.array(),
});

const ServersideUserSchema = UserScheme.omit({
	roles: true,
}).extend({
	roles: ServersideRoleSchema.array(),
	user_permissions: Action.array().optional(),
});

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
	ServersideRoleSchema,
	ServersideUserSchema,
	SupporterActionPreset,
};
