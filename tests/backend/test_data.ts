import {
	Department,
	EventType,
	NewTicket,
	Role,
	Tag,
	Ticket,
	TicketEvent,
	TicketHistory,
	TicketStatus,
	User,
} from "@shared/shared_types.ts";
import { DepartmentScheme, RoleScheme, TicketScheme } from "@shared/shared_schemas.ts";
import { ServersideRole, ServersideUser } from "@backend/model/serverside_types.ts";
import { ServersideRoleSchema, ServersideUserSchema } from "@backend/model/serverside_schemas.ts";
import {
	AdminActionPreset,
	RequesterActionPreset,
	SupporterActionPreset,
} from "@backend/model/serverside_schemas.ts";
import { z } from "zod";

export const testAdminDepartment: Department = {
	department_id: 0,
	department_name: "Admin",
	department_description: "Sys Admins",
};

export const testITDepartment: Department = {
	department_id: 1,
	department_name: "IT",
	department_description: "The IT Nannies",
};

export const testFinDepartment: Department = {
	department_id: 2,
	department_name: "Finance",
	department_description: "GRAB THAT MONEE",
};

export const departments: Department[] = [testAdminDepartment, testITDepartment, testFinDepartment];

export const testITReqRole: Role = {
	role_id: 1,
	role_name: "testITReqRole",
	role_description: "Requester role of IT Department",
	department: testITDepartment,
	actions: RequesterActionPreset.actions,
};
export const testITSuppRole: Role = {
	role_id: 2,
	role_name: "testITSuppRole",
	role_description: "Supporter role of IT Department",
	department: testITDepartment,
	actions: SupporterActionPreset.actions,
};
export const testFinReqRole: Role = {
	role_id: 3,
	role_name: "testFinReqRole",
	role_description: "Requester role of Financing Department",
	department: testFinDepartment,
	actions: RequesterActionPreset.actions,
};
export const testFinSuppRole: Role = {
	role_id: 4,
	role_name: "testFinSuppRole",
	role_description: "Supporter role  of Financing Department",
	department: testFinDepartment,
	actions: SupporterActionPreset.actions,
};
export const testAdminRole: Role = {
	role_id: 5,
	role_name: "testAdminRole",
	role_description: "Admin Role of System Admin Department",
	department: testAdminDepartment,
	actions: AdminActionPreset.actions,
};

export const roles: Role[] = [
	testITReqRole,
	testITSuppRole,
	testFinReqRole,
	testFinSuppRole,
	testAdminRole,
];

export const testUser1: User = {
	user_id: "1",
	user_name: "testUser1",
	roles: [testITReqRole, testFinSuppRole],
};
export const testUser2: User = {
	user_id: "2",
	user_name: "testUser2",
	roles: [testITSuppRole, testFinReqRole],
};
export const testAdmin: User = {
	user_id: "0",
	user_name: "testAdmin",
	roles: [testAdminRole],
};

export const users: User[] = [testAdmin, testUser1, testUser2];

export const testNewTicket1: NewTicket = {
	author: testUser1.user_name,
	ticket_title: "Financeing help",
	ticket_description: "need som cash fast & quick",
	departments: [testITDepartment],
};

export const testTicket1: Ticket = {
	ticket_id: "ticket1",
	author: testNewTicket1.author,
	ticket_title: testNewTicket1.ticket_title,
	ticket_description: testNewTicket1.ticket_description,
	departments: testNewTicket1.departments,
	ticket_status: TicketStatus.OPEN,
};
export const testTicket1Event1: TicketEvent = {
	ticket_id: testTicket1.ticket_id,
	event_id: "event1",
	author: testUser2.user_name,
	event_type: EventType.statusChange,
	new_status: TicketStatus.OPEN,
	created_at: "2025-01-012T12:00:00+02:00",
};
export const testTicket1History: TicketHistory = {
	ticket_id: testTicket1.ticket_id,
	events: [testTicket1Event1],
};

export const testNewTicket2: NewTicket = {
	author: testUser2.user_name,
	ticket_title: "PC not working",
	ticket_description: "Help my PC does not work",
	departments: [testITDepartment],
};
export const testTicket2: Ticket = {
	ticket_id: "ticket2",
	author: testNewTicket2.author,
	ticket_title: testNewTicket2.ticket_title,
	ticket_description: testNewTicket2.ticket_description,
	departments: testNewTicket2.departments,
	ticket_status: TicketStatus.IN_PROGRESS,
};
export const testTicket2Event1: TicketEvent = {
	ticket_id: testTicket2.ticket_id,
	event_id: "event21",
	author: testUser2.user_name,
	event_type: EventType.statusChange,
	new_status: TicketStatus.OPEN,
	created_at: "2025-01-012T13:00:00+02:00",
};
export const testTicket2Event2: TicketEvent = {
	ticket_id: testTicket2.ticket_id,
	event_id: "event22",
	author: testUser2.user_name,
	event_type: EventType.statusChange,
	new_status: TicketStatus.IN_PROGRESS,
	created_at: "2025-01-012T13:05:00+02:00",
};
export const testTicket2Event3: TicketEvent = {
	ticket_id: testTicket2.ticket_id,
	event_id: "event23",
	author: testUser2.user_name,
	event_type: EventType.Comment,
	content: "R u stupid?",
	created_at: "2025-01-012T13:05:00+02:00",
};
export const testTicket2History: TicketHistory = {
	ticket_id: "ticket2",
	events: [testTicket2Event1, testTicket2Event2, testTicket2Event3],
};

export const testITTag1: Tag = {
	tag_name: "Level2",
	abbreviation: "L2",
	department: testITDepartment,
	description: "Level 2 Support",
	style: "some hex encoded styling idk",
};
