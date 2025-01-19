import { z } from "zod";
import { ID, UUID } from "@shared/shared_schemas.ts";

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

const S_DTORoleCreate = z.object({
	role_name: z.string(),
	role_description: z.string().nullable(),
});
const S_DTORole = S_DTORoleCreate.extend({
	pk_role_id: ID,
});
const S_DTORoleParsed = S_DTORole.extend({
	department: S_DTODepartment,
	actions: S_DTOAction.array(),
}).transform(({ pk_role_id, actions, department, ...rest }) => {
	return {
		role_id: pk_role_id,
		...rest,
		department: {
			department_id: department.pk_department_id,
			department_name: department.department_name,
			department_description: department.department_description,
		},
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

export type DTOAction = z.infer<typeof S_DTOAction>;

export type DTODepartmentCreate = z.infer<typeof S_DTODepartmentCreate>;
export type DTODepartment = z.infer<typeof S_DTODepartment>;

export type DTORoleCreate = z.infer<typeof S_DTORoleCreate>;
export type DTORole = z.infer<typeof S_DTORole>;
// export type DTORoleExtended = z.output<typeof S_DTORoleParsed>;

export type DTOUserCreate = z.infer<typeof S_DTOUserCreate>;
export type DTOUser = z.infer<typeof S_DTOUser>;

export type DTOStatus = z.infer<typeof S_DTOStatus>;
export type DTOEventType = z.infer<typeof S_DTOEventType>;

export {
	S_DTOAction,
	S_DTODepartment,
	S_DTODepartmentCreate,
	S_DTOEventType,
	S_DTORole,
	S_DTORoleCreate,
	S_DTORoleParsed,
	S_DTOStatus,
	S_DTOUser,
	S_DTOUserCreate,
	S_DTOUserExtendedParsed,
};
