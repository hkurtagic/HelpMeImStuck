import { z } from "zod";
import { Actions, EventType as event_type, TicketStatus as ticket_status } from "./shared_types.ts";

const zTicketStatus = z.nativeEnum(ticket_status);
const EventType = z.nativeEnum(event_type);
const zAction = z.nativeEnum(Actions);

// const UUIDScheme = z.string().refine(
// 	(value) =>
// 		/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
// 			value ?? "",
// 		),
// 	"ID should be a valid UUID",
// );
const UUID = z.string(); //.uuid("ID is not a valid UUID");
const ID = z.number().int("ID is not a valid Number").nonnegative("ID should not be negative");
const zIDparam = z.record(z.string(), z.preprocess((v) => Number(v), ID)).transform(({ ...k }) => {
	return Object.values(k)[0];
});
const zUUIDparam = z.record(z.string(), UUID).transform(({ ...k }) => {
	return Object.values(k)[0];
});

const NewDepartmentScheme = z.object({
	department_name: z.string(),
	department_description: z.string().optional(),
});

const DepartmentScheme = NewDepartmentScheme.extend({
	department_id: ID,
});

// const TestNewDepartmentScheme = z.object({
// 	department_name: z.string().optional(),
// 	department_description: z.string().optional(),
// });

// const TestDepartmentScheme = TestNewDepartmentScheme.extend({
// 	department_id: ID,
// });

const NewRoleScheme = z.object({
	role_name: z.string(),
	role_description: z.string().optional(),
	department: DepartmentScheme,
	actions: zAction.array().optional(),
});

const RoleScheme = NewRoleScheme.extend({
	role_id: ID,
});

const LoginUserScheme = z.object({
	user_name: z.string(),
	password: z.string(),
});

const NewUserScheme = LoginUserScheme.extend({
	roles: RoleScheme.array(),
});

const UserScheme = NewUserScheme.extend({
	user_id: UUID,
}).omit({
	password: true,
});

// const TestNewUserScheme = LoginUserScheme.extend({
// 	roles: RoleScheme.array().optional(),
// });

// const TestUserScheme = TestNewUserScheme.extend({
// 	user_id: z.string(),
// }).omit({
// 	password: true,
// });

const TagScheme = z.object({
	tag_name: z.string(),
	abbreviation: z.string(),
	description: z.string().optional(),
	department: DepartmentScheme,
	style: z.string().optional(),
});

const NewTicketScheme = z.object({
	author: UserScheme.omit({ roles: true }),
	departments: DepartmentScheme.array(),
	ticket_title: z.string(),
	ticket_description: z.string(),
	images: z.string().array().optional(),
});

const TicketScheme = NewTicketScheme.extend({
	ticket_id: UUID,
	ticket_status: zTicketStatus,
	tags: TagScheme.array().optional(),
});

const BaseTicketEventScheme = z.object({
	event_id: UUID,
	ticket_id: z.string(),
	author: UserScheme.omit({ roles: true }),
	created_at: z.string().datetime({ offset: true }),
});

const TicketEvent_StatusChangeScheme = BaseTicketEventScheme.extend({
	event_type: z.literal(EventType.enum.statusChange),
	new_status: zTicketStatus,
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
	ticket_id: UUID,
	events: TicketHistoryEventScheme.array(),
});

export {
	DepartmentScheme,
	ID,
	LoginUserScheme,
	NewDepartmentScheme,
	NewRoleScheme,
	NewTicketScheme,
	NewUserScheme,
	RoleScheme,
	TagScheme,
	// TestDepartmentScheme,
	// TestNewDepartmentScheme,
	// TestUserScheme,
	TicketEventScheme,
	TicketHistoryScheme,
	TicketScheme,
	UserScheme,
	UUID,
	zIDparam,
	zTicketStatus,
	zUUIDparam,
};
