enum RequesterActions {
	ticket_create,
	ticket_pullBack,
	ticket_closeOwn,
}
enum SupporterActions {
	ticket_seeTickets,
	ticket_accept,
	ticket_close,
	ticket_forward,
	ticket_addDepartment,
	ticket_addTag,
}

enum AdminActions {
	user_create,
	user_modify,
	user_delete,
	role_create,
	role_modify,
	role_delete,
	department_create,
	department_modify,
	department_delete,
}
type Actions = RequesterActions | SupporterActions | AdminActions;

enum EventType {
	statusChange,
	departmentAdded,
	departmentForwarded,
	Comment,
}

enum TicketStatus {
	OPEN,
	IN_PROGRESS,
	CLOSED,
}

interface LoginRequestBody {
	username: string;
	password: string;
}
interface LoginReply {
	user_name: string;
}
interface newDepartment {
	department_name: string;
	department_description?: string;
}
interface Department extends newDepartment {
	department_id: number;
}
interface Role {
	role_id: number;
	role_name: string;
	description?: string;
	department: Department;
	actions?: Actions[];
}

interface User {
	user_id: string;
	user_name: string;
	password?: string;
	roles?: Role[];
	user_permissions?: Actions[];
}

interface Ticket {
	ticket_id: string;
	author: string;
	departments: Department[];
	title: string;
	description: string;
	status: TicketStatus;
	images?: Blob;
}
interface TicketEvent {
	event_id: number;
	author: string;
	created_at: number;
	event_type: string;
	description: string;
	content?: string;
	images?: Blob[];
}

interface TicketHistory {
	ticket_id: string;
	events: TicketEvent[];
}

// type ImageType = "png" | "jpeg";
// type Base64<imageType extends ImageType> = `data:image/${imageType};base64,${string}`;

export type {
	Actions,
	// Base64,
	Department,
	// ImageType,
	LoginReply,
	LoginRequestBody,
	newDepartment,
	Role,
	Ticket,
	TicketEvent,
	TicketHistory,
	User,
};
export { EventType, TicketStatus };
