enum Action {
	createUser,
	modifyUser,
	deleteUser,
}

interface LoginRequestBody {
	username: string;
	password: string;
}
interface LoginReply {
	user_name: string;
}

interface Department {
	department_id: number;
	department_name: string;
}
interface Role {
	role_id: number;
	role_name: string;
	description?: string;
	department: Department;
	actions?: Action[];
}

interface User {
	user_id: string;
	user_name: string;
	password?: string;
	roles?: Role[];
	user_permissions?: Action[];
}

interface Ticket {
	ticket_id: string;
	author: string;
	departments: Department[];
	title: string;
	description: string;
	status: string;
	images?: Blob[];
}
interface TicketEvent {
	event_id: number;
	author: string;
	created_at: number;
	event_type: string;
	description: string;
	content?: string;
	images?: Base64<ImageType>[];
}

interface TicketHistory {
	ticket_id: string;
	events: TicketEvent[];
}

type ImageType = "png" | "jpeg";
type Base64<imageType extends ImageType> = `data:image/${imageType};base64,${string}`;

export type {
	Base64,
	Department,
	ImageType,
	LoginReply,
	LoginRequestBody,
	Role,
	Ticket,
	TicketEvent,
	TicketHistory,
	User,
};
export { Action };
