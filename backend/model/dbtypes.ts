interface dbUser {
    user_id: string;
    username: string;
    password: string;
    created_at: Date;
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
