interface DbUser {
    pk_user_id: string;
    user_name: string;
    password_hash: string;
    created_at: number;
    updated_at: number;
}

interface DbDepartments {
    dept_id: number;
    deparment_name: string;
    description: string;
}

interface DbAction {
    action_id: number;
    action_name: string;
}

interface DbRole {
    role_id: number;
    role_name: string;
    description: string;
    fk_department_id: number;
    pk_action_id: number;
    action_name: string;
}

export type {DbUser, DbDepartments, DbAction, DbRole};
