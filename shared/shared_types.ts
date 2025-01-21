import { z } from "zod";
import {
    ID,
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
    UUID,
} from "./shared_schemas.ts";

enum Actions {
    ticket_create = 1,
    ticket_pullBack,
    ticket_closeOwn,
    ticket_seeDepartmentTickets,
    ticket_accept,
    ticket_close,
    ticket_forward,
    ticket_addDepartment,
    ticket_addTag,
    ticket_removeTag,
    tag_ownDeartment_manage,
    tag_manage,
    user_ownDeartment_create,
    user_ownDeartment_modify,
    user_ownDeartment_delete,
    user_create,
    user_modify,
    user_delete,
    role_ownDeartment_create,
    role_ownDeartment_modify,
    role_ownDeartment_delete,
    role_create,
    role_modify,
    role_delete,
    department_ownDeartment_modify,
    department_create,
    department_modify,
    department_delete,
}

enum EventType {
    createTicket = 1,
    statusChange,
    departmentAdded,
    departmentForwarded,
    comment,
}

enum TicketStatus {
    OPEN = 1,
    IN_PROGRESS,
    CLOSED,
}

export type DepartmentCreate = z.infer<typeof S_DepartmentCreate>;
export type Department = z.output<typeof S_Department>;
export type RoleCreate = z.infer<typeof S_RoleCreate>;
export type Role = z.output<typeof S_Role>;
export type RoleAdmin = z.infer<typeof S_RoleAdmin>;
export type UserLogin = z.infer<typeof S_UserLogin>;
export type UserCreate = z.infer<typeof S_UserCreate>;
export type User = z.output<typeof S_User>;
export type UserPreview = z.infer<typeof S_UserPreview>;
export type UserAdmin = z.infer<typeof S_UserAdmin>;
export type TicketCreate = z.infer<typeof S_TicketCreate>;
export type Ticket = z.infer<typeof S_Ticket>;
export type TicketEvent_Create = z.infer<typeof S_TicketEvent_Create>;
export type TicketEvent_StatusChange = z.infer<typeof S_TicketEvent_StatusChange>;
export type TicketEvent_DepartmentAdded = z.infer<typeof S_TicketEvent_DepartmentAdded>;
export type TicketEvent_DepartmentForwarded = z.infer<typeof S_TicketEvent_DepartmentForwarded>;
export type TicketEvent_Comment = z.infer<typeof S_TicketEvent_Comment>;
export type TicketEvent = z.infer<typeof S_TicketEvent>;
export type TicketHistoryEvent = z.infer<typeof S_TicketHistoryEvent>;
export type TicketHistory = z.infer<typeof S_TicketHistory>;
export type Tag = z.infer<typeof S_Tag>;
export type UUID = z.infer<typeof UUID>;
export type ID = z.infer<typeof ID>;

// interface LoginRequestBody {
// 	username: string;
// 	password: string;
// }
// interface LoginReply {
// 	user_name: string;
// }
// interface newDepartment {
// 	department_name: string;
// 	department_description?: string;
// }
// interface Department extends newDepartment {
// 	department_id: number;
// }
// interface Role {
// 	role_id: number;
// 	role_name: string;
// 	description?: string;
// 	department: Department;
// 	actions?: Actions[];
// }

// interface User {
// 	user_id: string;
// 	user_name: string;
// 	password?: string;
// 	roles?: Role[];
// 	user_permissions?: Actions[];
// }

// interface Ticket {
// 	ticket_id: string;
// 	author: string;
// 	departments: Department[];
// 	title: string;
// 	description: string;
// 	status: TicketStatus;
// 	images?: Blob;
// }
// interface TicketEvent {
// 	event_id: number;
// 	author: string;
// 	created_at: number;
// 	event_type: string;
// 	description: string;
// 	content?: string;
// 	images?: Blob[];
// }

// interface TicketHistory {
// 	ticket_id: string;
// 	events: TicketEvent[];
// }

// type ImageType = "png" | "jpeg";
// type Base64<imageType extends ImageTypeScheme> = `data:image/${imageType};base64,${string}`;

// export type {
// 	Department,
// 	LoginUser,
// 	NewDepartment,
// 	NewRole,
// 	NewTicket,
// 	Role,
// 	Tag,
// 	Ticket,
// 	TicketEvent,
// 	TicketHistory,
// 	User,
// }; // Base64,
// Department,
// // ImageType,
// LoginReply,
// LoginRequestBody,
// newDepartment,
// Role,
// Ticket,
// TicketEvent,
// TicketHistory,
// User,
export { Actions, EventType, TicketStatus };
