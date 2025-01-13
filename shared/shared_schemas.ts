import { z } from "zod";
import { EventType as event_type, TicketStatus as ticket_status } from "./shared_types.ts";

const TicketStatus = z.nativeEnum(ticket_status);
const EventType = z.nativeEnum(event_type);

const UUIDScheme = z.string().refine(
	(value) =>
		/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
			value ?? "",
		),
	"ID should be a valid UUID",
);

const NewDepartmentScheme = z.object({
	department_name: z.string(),
	department_description: z.string().optional(),
});

const DepartmentScheme = NewDepartmentScheme.extend({
	department_id: z.number(),
});

const NewRoleScheme = z.object({
	role_name: z.string(),
	role_description: z.string().optional(),
	department: DepartmentScheme,
});

const RoleScheme = NewRoleScheme.extend({
	role_id: z.number(),
});

const LoginUserScheme = z.object({
	user_name: z.string(),
	password: z.string(),
});

const NewUserScheme = LoginUserScheme.extend({
	roles: RoleScheme.array(),
});

const UserScheme = NewUserScheme.extend({
	user_id: UUIDScheme,
}).omit({
	password: true,
});

const TagScheme = z.object({
	tag_name: z.string(),
	abbreviation: z.string(),
	description: z.string().optional(),
	department: DepartmentScheme,
	style: z.string().optional(),
});

const NewTicketScheme = z.object({
	author: z.string(),
	departments: DepartmentScheme.array(),
	ticket_title: z.string(),
	ticket_description: z.string(),
	images: z.string().array().optional(),
});

const TicketScheme = NewTicketScheme.extend({
	ticket_id: UUIDScheme,
	ticket_status: TicketStatus,
	tags: TagScheme.array().optional(),
});

const BaseTicketEventScheme = z.object({
	event_id: UUIDScheme,
	ticket_id: z.string(),
	author: z.string(),
	created_at: z.string().datetime({ offset: true }),
});

const TicketEvent_StatusChangeScheme = BaseTicketEventScheme.extend({
	event_type: z.literal(EventType.enum.statusChange),
	new_status: TicketStatus,
});
const TicketEvent_DepartmentAddedScheme = BaseTicketEventScheme.extend({
	event_type: z.literal(EventType.enum.departmentAdded),
	department: DepartmentScheme,
});
const TicketEvent_DepartmentForwardedScheme = BaseTicketEventScheme.extend({
	event_type: z.literal(EventType.enum.departmentForwarded),
	department: DepartmentScheme,
});
const TicketEvent_CommentScheme = BaseTicketEventScheme.extend({
	event_type: z.literal(EventType.enum.Comment),
	content: z.string(),
	images: z.string().optional(),
});
const TicketEventScheme = z.discriminatedUnion("event_type", [
	TicketEvent_StatusChangeScheme,
	TicketEvent_DepartmentAddedScheme,
	TicketEvent_DepartmentForwardedScheme,
	TicketEvent_CommentScheme,
]);
const TicketHistoryEventScheme = z.discriminatedUnion("event_type", [
	TicketEvent_StatusChangeScheme.omit({ ticket_id: true }),
	TicketEvent_DepartmentAddedScheme.omit({ ticket_id: true }),
	TicketEvent_DepartmentForwardedScheme.omit({ ticket_id: true }),
	TicketEvent_CommentScheme.omit({ ticket_id: true }),
]);
const TicketHistoryScheme = z.object({
	ticket_id: z.string(),
	events: TicketHistoryEventScheme.array(),
});

export {
	DepartmentScheme,
	LoginUserScheme,
	NewDepartmentScheme,
	NewRoleScheme,
	NewTicketScheme,
	NewUserScheme,
	RoleScheme,
	TagScheme,
	TicketEventScheme,
	TicketHistoryScheme,
	TicketScheme,
	UserScheme,
	UUIDScheme,
};
