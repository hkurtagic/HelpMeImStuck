import { z } from "zod";
import { ID, UUID, zEventType, zTicketStatus } from "@shared/shared_schemas.ts";

const S_DTOAction = z.object({
    pk_action_id: ID,
    action_name: z.string(),
});
// parse DB structure to arra of IDs
const S_DTOActionParsed = S_DTOAction.transform(({ pk_action_id, ..._ }) => {
    return pk_action_id;
}).readonly();

const S_DTODepartmentCreate = z.object({
    department_name: z.string(),
    department_description: z.string().nullable(),
});
const S_DTODepartment = S_DTODepartmentCreate.extend({
    pk_department_id: ID,
});
const S_DTODepartmentParsed = S_DTODepartment.transform(
    ({ pk_department_id, department_name, department_description }) => {
        return {
            department_id: pk_department_id,
            department_name: department_name,
            department_description: department_description,
        };
    },
);

const S_DTORoleCreate = z.object({
    role_name: z.string(),
    role_description: z.string().nullable(),
});
const S_DTORole = S_DTORoleCreate.extend({
    pk_role_id: ID,
});
const S_DTORoleParsed = S_DTORole.extend({
    department: S_DTODepartmentParsed,
    actions: S_DTOAction.array(),
}).transform(({ pk_role_id, actions, department, ...rest }) => {
    return {
        role_id: pk_role_id,
        ...rest,
        department,
        actions: actions.map(({ pk_action_id }) => pk_action_id),
    };
});

const S_DTOUserCreate = z.object({
    user_name: z.string(),
    password_hash: z.string(),
});

const S_DTOUser = S_DTOUserCreate.extend({
    pk_user_id: UUID,
});

const S_DTOUserExtendedParsed = S_DTOUser.extend({
    roles: S_DTORoleParsed.array(),
    actions: S_DTOActionParsed.array().nullable(),
}).transform(({ pk_user_id, password_hash, ...rest }) => {
    return {
        user_id: pk_user_id,
        password: password_hash,
        ...rest,
    };
});

const S_DTOStatus = z.object({
    pk_status_id: ID,
    status_name: z.string(),
});

const S_DTOEventType = z.object({
    pk_event_type_id: ID,
    event_type_name: z.string(),
});

const S_DTOEvent = z.object({
    pk_event_id: ID,
    event_description: z.string().optional().nullable(),
    event_content: z.string(),
});

const S_DTOImage = z.object({
    pk_image_id: UUID,
    image_content: z.string(),
    image_type: z.string().nullable().optional(),
});

const S_DTOTagCreate = z.object({
    tag_name: z.string(),
    tag_abbreviation: z.string(),
    tag_description: z.string().optional().nullable(),
    tag_style: z.string().optional().nullable(),
});
const S_DTOTag = S_DTOTagCreate.extend({
    pk_tag_id: ID,
});
const S_DTOTagParsed = S_DTOTag.extend({ Department: S_DTODepartmentParsed }).transform(
    ({ pk_tag_id, Department, ...rest }) => {
        return { tag_id: pk_tag_id, department: Department, ...rest };
    },
).readonly();

const S_DTOTicketCreate = z.object({
    ticket_title: z.string(),
    ticket_description: z.string(),
});

const S_DTOTicket = S_DTOTicketCreate.extend({
    pk_ticket_id: UUID,
});
const S_DTOTicketExtendedParsed = S_DTOTicket.extend({
    departments: S_DTODepartmentParsed.array(),
    author: S_DTOUser.omit({ password_hash: true }),
    // Status: S_DTOStatus.omit({ pk_status_id: true }).transform(({ status_name, ..._ }) => {
    // 	return status_name;
    // }),
    Status: S_DTOStatus.omit({ status_name: true }).transform(({ pk_status_id, ..._ }) => {
        return pk_status_id;
    }),
    Tags: S_DTOTag.array().nullable(),
    Images: S_DTOImage.array().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
}).transform(
    (
        { pk_ticket_id, Status, author, departments, Tags, Images, createdAt, updatedAt, ...rest },
    ) => {
        return {
            ticket_id: pk_ticket_id,
            ticket_status: Status,
            author: {
                user_id: author.pk_user_id,
                user_name: author.user_name,
            },
            departments,
            tags: Tags,
            images: Images,
            ...rest,
            created_at: createdAt,
            upadted_at: updatedAt,
        };
    },
);

const S_DTOTicketHistoryEvent = z.object({
    pk_event_id: ID,
    // fk_ticket_id: UUID,
    event_description: z.string().nullable(),
    event_content: z.string(),
    author: S_DTOUser.omit({ password_hash: true }),
    EventType: z.object({ pk_event_type_id: zEventType }),
    images: z.string().array().optional(),
    createdAt: z.date(),
}).transform(
    ({ pk_event_id, event_content, author, EventType, images, createdAt, ...rest }) => {
        const base = {
            event_id: pk_event_id,
            // ticket_id: fk_ticket_id,
            author: { user_id: author.pk_user_id, user_name: author.user_name },
            event_type: EventType.pk_event_type_id,
            ...rest,
            created_at: createdAt,
        };
        switch (EventType.pk_event_type_id) {
            case zEventType.enum.createTicket:
                return {
                    ...base,
                    // new_status: zTicketStatus.parse(parseInt(event_content)), //parseInt(event_content) as TicketStatus,
                };
            case zEventType.enum.statusChange:
                return {
                    ...base,
                    new_status: zTicketStatus.parse(parseInt(event_content)),
                };
            case zEventType.enum.departmentAdded:
                return {
                    ...base,
                    department_id: ID.parse(event_content),
                };
            case zEventType.enum.departmentForwarded:
                return {
                    ...base,
                    department_id: ID.parse(event_content),
                };
            case zEventType.enum.comment:
                return {
                    ...base,
                    comment: event_content,
                    images: images,
                };
        }
    },
);
const S_DTOTicketHistory = z.object({
    ticket_id: UUID,
    events: S_DTOTicketHistoryEvent.array(),
});

// const S_TicketEvent_Create = S_DTOTicketHistoryEventBase.extend({
// 	event_type: z.literal(zEventType.enum.createTicket),
// });

// const S_TicketEvent_StatusChange = S_DTOTicketHistoryEventBase.extend({
// 	event_type: z.literal(zEventType.enum.statusChange),
// }).transform(({ pk_event_id, event_content, ...rest }) => {
// 	return {
// 		event_id: pk_event_id,
// 		...rest,
// 		new_status: Number(event_content) as TicketStatus,
// 	};
// });
// const S_TicketEvent_DepartmentAdded = S_DTOTicketHistoryEventBase.extend({
// 	event_type: z.literal(zEventType.enum.departmentAdded),
// 	department_id: ID,
// });
// const S_TicketEvent_DepartmentForwarded = S_DTOTicketHistoryEventBase.extend({
// 	event_type: z.literal(zEventType.enum.departmentForwarded),
// 	department_id: ID,
// });
// const S_TicketEvent_Comment = S_DTOTicketHistoryEventBase.extend({
// 	event_type: z.literal(zEventType.enum.comment),
// 	comment: z.string(),
// 	images: z.string().array().optional().nullable(),
// });
// const S_DTOTicketHistoryEvent = z.discriminatedUnion("event_type", [
// 	S_TicketEvent_Create,
// 	S_TicketEvent_StatusChange,
// 	S_TicketEvent_DepartmentAdded,
// 	S_TicketEvent_DepartmentForwarded,
// 	S_TicketEvent_Comment,
// ]);

export type DTOStatus = z.infer<typeof S_DTOStatus>;
export type DTOTag = z.infer<typeof S_DTOTag>;
export type DTOTagCreate = z.infer<typeof S_DTOTagCreate>;

export type DTOAction = z.infer<typeof S_DTOAction>;

export type DTODepartmentCreate = z.infer<typeof S_DTODepartmentCreate>;
export type DTODepartment = z.infer<typeof S_DTODepartment>;

export type DTORoleCreate = z.infer<typeof S_DTORoleCreate>;
export type DTORole = z.infer<typeof S_DTORole>;
// export type DTORoleExtended = z.output<typeof S_DTORoleParsed>;

export type DTOUserCreate = z.infer<typeof S_DTOUserCreate>;
export type DTOUser = z.infer<typeof S_DTOUser>;

export type DTOTicketCreate = z.infer<typeof S_DTOTicketCreate>;
export type DTOTicket = z.infer<typeof S_DTOTicket>;

export type DTOEventType = z.infer<typeof S_DTOEventType>;
export type DTOEvent = z.infer<typeof S_DTOEvent>;

export type DTOImage = z.infer<typeof S_DTOImage>;

export type DTOTicketHistoryEvent = z.infer<typeof S_DTOTicketHistoryEvent>;
export type DTOTicketHistory = z.infer<typeof S_DTOTicketHistory>;

export {
    S_DTOAction,
    S_DTODepartment,
    S_DTODepartmentCreate,
    S_DTOEvent,
    S_DTOEventType,
    S_DTOImage,
    S_DTORole,
    S_DTORoleCreate,
    S_DTORoleParsed,
    S_DTOStatus,
    S_DTOTag,
    S_DTOTagCreate,
    S_DTOTagParsed,
    S_DTOTicket,
    S_DTOTicketExtendedParsed,
    S_DTOTicketHistory,
    S_DTOTicketHistoryEvent,
    S_DTOUser,
    S_DTOUserCreate,
    S_DTOUserExtendedParsed,
};
