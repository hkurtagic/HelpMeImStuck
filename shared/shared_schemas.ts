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
const UUID = z.string(); //.uuid("ID is not a valid UUID");
const ID = z.coerce.number().int("ID is not a valid Number").nonnegative(
    "ID should not be negative",
);
const zIDparam = z.record(z.string(), z.preprocess((v) => Number(v), ID)).transform(({ ...k }) => {
    return Object.values(k)[0];
});
const zUUIDparam = z.record(z.string(), UUID).transform(({ ...k }) => {
    return Object.values(k)[0];
});

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
const ManagerActionPreset = AllowedActions.parse({
    actions: [
        ...SupporterActionPreset.actions,
        zAction.enum.tag_ownDeartment_manage,
        zAction.enum.user_ownDeartment_create,
        zAction.enum.user_ownDeartment_modify,
        zAction.enum.role_ownDeartment_create,
        zAction.enum.role_ownDeartment_modify,
        zAction.enum.role_ownDeartment_delete,
        zAction.enum.department_ownDeartment_modify,
    ],
});

const AdminActionPreset = AllowedActions.parse({
    actions: [
        ...ManagerActionPreset.actions,
        ...Object.values(zAction.enum).filter((a) => {
            if (typeof a === "number" && !(ManagerActionPreset.actions.includes(a))) return a;
            return;
        }),
    ],
});

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

const S_Role = S_RoleCreate.omit({ actions: true }).extend({
    role_id: ID,
});

const S_RoleAdmin = S_Role.extend({
    actions: zAction.array(),
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
    roles: S_RoleAdmin.array(),
}).omit({
    password: true,
});

const S_UserAdmin = S_User.extend({
    password: z.string().optional(),
    actions: zAction.array(),
});

// intended for ticket history and non admin purposes
const S_UserPreview = S_User.omit({
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
    created_at: z.date(),
});

const S_TicketEventBase = z.object({
    // event_id: UUID,
    ticket_id: UUID,
    author: S_UserPreview,
    created_at: z.date().optional(),
});

const S_TicketEvent_Create = S_TicketEventBase.extend({
    event_type: z.literal(zEventType.enum.createTicket),
});

const S_TicketEvent_StatusChange = S_TicketEventBase.extend({
    event_type: z.literal(zEventType.enum.statusChange),
    new_status: zTicketStatus,
});
const S_TicketEvent_DepartmentAdded = S_TicketEventBase.extend({
    event_type: z.literal(zEventType.enum.departmentAdded),
    department_id: ID,
});
const S_TicketEvent_DepartmentForwarded = S_TicketEventBase.extend({
    event_type: z.literal(zEventType.enum.departmentForwarded),
    department_id: ID,
});
const S_TicketEvent_Comment = S_TicketEventBase.extend({
    event_type: z.literal(zEventType.enum.comment),
    comment: z.string(),
    images: z.string().array().optional().nullable(),
});
const S_TicketEvent = z.discriminatedUnion("event_type", [
    S_TicketEvent_Create,
    S_TicketEvent_StatusChange,
    S_TicketEvent_DepartmentAdded,
    S_TicketEvent_DepartmentForwarded,
    S_TicketEvent_Comment,
]);
const S_TicketHistoryEvent = z.discriminatedUnion("event_type", [
    S_TicketEvent_Create.omit({ ticket_id: true }),
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
    AdminActionPreset,
    ID,
    RequesterActionPreset,
    S_Department,
    S_DepartmentCreate,
    S_Role,
    S_RoleAdmin,
    S_RoleCreate,
    S_Tag,
    S_Ticket,
    S_TicketCreate,
    S_TicketEvent,
    S_TicketEvent_Comment,
    S_TicketEvent_Create,
    S_TicketEvent_DepartmentAdded,
    S_TicketEvent_DepartmentForwarded,
    S_TicketEvent_StatusChange,
    S_TicketHistory,
    S_TicketHistoryEvent,
    S_User,
    S_UserAdmin,
    S_UserCreate,
    S_UserLogin,
    S_UserPreview,
    // ManagerActionPreset,
    SupporterActionPreset,
    UUID,
    zAction,
    zEventType,
    zIDparam,
    zTicketStatus,
    zUUIDparam,
};
