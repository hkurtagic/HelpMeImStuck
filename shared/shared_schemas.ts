import { z } from "zod";
import { Actions, EventType, TicketStatus } from "./shared_types.ts";

const zTicketStatus = z.nativeEnum(TicketStatus);
const zEventType = z.nativeEnum(EventType);
const zAction = z.nativeEnum(Actions);

// const UUIDScheme = z.string().refine(
// 	(value) =>
// 		/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
// 			value ?? "",
// 		),
// 	"ID should be a valid UUID",
// );
const UUID = z.string().uuid("ID is not a valid UUID");
const ID = z.number().int("ID is not a valid Number").nonnegative("ID should not be negative");

const S_DepartmentCreate = z.object({
	department_name: z.string(),
	department_description: z.string().optional().nullable(),
});

const S_Department = S_DepartmentCreate.extend({
	department_id: ID,
});

const S_RoleCreate = z.object({
	role_name: z.string(),
	role_description: z.string().optional().nullable(),
	department: S_Department,
	actions: zAction.array(),
});

const S_Role = S_RoleCreate.extend({
	role_id: ID,
});

const S_UserLogin = z.object({
	user_name: z.string(),
	password: z.string(),
});

const S_UserCreate = S_UserLogin.extend({
	roles: S_Role.array(),
	actions: zAction.array().optional(),
});

const S_User = S_UserCreate.extend({
	user_id: UUID,
}).omit({
	password: true,
});
// intended for ticket history and non admin purposes
const S_UserPreview = S_User.omit({
	actions: true,
	roles: true,
});

const S_Tag = z.object({
	tag_name: z.string(),
	abbreviation: z.string(),
	description: z.string().optional().nullable(),
	department: S_Department,
	style: z.string().optional(),
});

const S_TicketCreate = z.object({
	author: S_UserPreview,
	departments: S_Department.array(),
	ticket_title: z.string(),
	ticket_description: z.string(),
	images: z.string().array().optional().nullable(),
});

const S_Ticket = S_TicketCreate.extend({
	ticket_id: UUID,
	ticket_status: zTicketStatus,
	tags: S_Tag.array().optional().nullable(),
});

const S_TicketEventBase = z.object({
	// event_id: UUID,
	ticket_id: z.string(),
	author: S_UserPreview,
	created_at: z.string().datetime({ offset: true }),
});

const S_TicketEvent_StatusChange = S_TicketEventBase.extend({
	event_type: z.literal(zEventType.enum.statusChange),
	content: zTicketStatus,
});
const S_TicketEvent_DepartmentAdded = S_TicketEventBase.extend({
	event_type: z.literal(zEventType.enum.departmentAdded),
	content: S_Department,
});
const S_TicketEvent_DepartmentForwarded = S_TicketEventBase.extend({
	event_type: z.literal(zEventType.enum.departmentForwarded),
	content: S_Department,
});
const S_TicketEvent_Comment = S_TicketEventBase.extend({
	event_type: z.literal(zEventType.enum.comment),
	content: z.string(),
	images: z.string().optional().nullable(),
});
const S_TicketEvent = z.discriminatedUnion("event_type", [
	S_TicketEvent_StatusChange,
	S_TicketEvent_DepartmentAdded,
	S_TicketEvent_DepartmentForwarded,
	S_TicketEvent_Comment,
]);
const S_TicketHistoryEvent = z.discriminatedUnion("event_type", [
	S_TicketEvent_StatusChange.omit({ ticket_id: true }),
	S_TicketEvent_DepartmentAdded.omit({ ticket_id: true }),
	S_TicketEvent_DepartmentForwarded.omit({ ticket_id: true }),
	S_TicketEvent_Comment.omit({ ticket_id: true }),
]);
const S_TicketHistory = z.object({
	ticket_id: UUID,
	events: S_TicketHistoryEvent.array(),
});

export {
	ID,
	S_Department,
	S_DepartmentCreate,
	S_Role,
	S_RoleCreate,
	S_Tag,
	S_Ticket,
	S_TicketCreate,
	S_TicketEvent,
	S_TicketHistory,
	S_User,
	S_UserCreate,
	S_UserLogin,
	S_UserPreview,
	UUID,
	zAction,
	zEventType,
	zTicketStatus,
};
