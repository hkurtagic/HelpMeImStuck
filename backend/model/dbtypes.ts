interface dbUser {
  pk_user_id: string;
  user_name: string;
  password_hash: string;
  created_at: number;
  updated_at: number;
}
interface dbDepartments {
  pk_department_id: number;
  department_name: string;
  description?: string;
}
interface dbAction {
  pk_action_id: number;
  action_name: string;
}
interface dbRole {
  pk_role_id: number;
  role_name: string;
  description: string;
  fk_department_id: number;
  pk_action_id: number;
  action_name: string;
}

export type { dbAction, dbDepartments, dbRole, dbUser };
