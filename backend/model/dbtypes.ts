interface dbUser {
    pk_user_id: string;
    user_name: string;
    password_hash: string;
    created_at: number;
    updated_at: number;
}
interface dbDepartments {
    dept_id: number;
    deparment_name: string;
    description: string;
}
interface dbAction {
    action_id: number;
    action_name: string;
}
interface dbRole {
    role_id: number;
    role_name: string;
    description: string;
    fk_department_id: number;
    pk_action_id: number;
    action_name: string;
}

export type { dbUser, dbDepartments, dbAction, dbRole };
