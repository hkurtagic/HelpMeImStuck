export const SQLNoUserFound = (user_id?: string, user_name?: string) =>
	new Error(`!> User with id=${user_id} and username=${user_name} not found.`);
export const SQLNoRoleFound = (role_id?: number, role_name?: string) =>
	new Error(`!> Role with id=${role_id} and rolename=${role_name} not found.`);
export const SQLNoDepartmentFound = (department_id?: number, department_name?: string) =>
	new Error(
		`!> Department with id=${department_id} and departmentname=${department_name} not found.`,
	);
export const SQLNoActionFound = (action_id?: number, action_name?: string) =>
	new Error(`!> Action with id=${action_id} and actionname=${action_name} not found.`);
