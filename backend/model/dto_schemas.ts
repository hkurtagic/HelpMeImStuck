import { z } from "zod";
import { Actions as AllActions } from "@shared/shared_types.ts";
import { RoleScheme, UserScheme, UUID, zTicketStatus } from "@shared/shared_schemas.ts";

const DTOStatusSchema = z.object({
	pk_status_id: z.number().nonnegative(),
	status_name: zTicketStatus,
}).transform(({ pk_status_id, ...rest }) => {
	return {
		status_id: pk_status_id,
		...rest,
	};
});

// const DTODepartmentSchema = z.object({
// 	pk_department_id: z.number().nonnegative(),
// 	status_name: zTicketStatus,
// }).transform(({ pk_department_id, ...rest }) => {
// 	return {
// 		department_id: pk_department_id,
// 		...rest,
// 	};
// });

// const DTOUserSchema = z.object({
// 	pk_user_id: UUID,
// 	status_name: zTicketStatus,
// }).transform(({ pk_user_id, ...rest }) => {
// 	return {
// 		user_id: pk_user_id,
// 		...rest,
// 	};
// });

export { DTOStatusSchema };
