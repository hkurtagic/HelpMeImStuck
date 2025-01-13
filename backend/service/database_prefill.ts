import database from "@backend/service/database.ts";
import { AlgorithmName, hash } from "jsr:@stdext/crypto/hash";
import { Actions, TicketStatus } from "@shared/shared_types.ts";

export default function prefillDB() {
	// possible ticket statuses
	// const init_statuses = Object.keys(TicketStatus).filter((key) => isNaN(Number(key))); //["OPEN", "IN_PROGRESS", "CLOSED"];
	const init_event_types = ["ACTION", "COMMENT"];
	const init_departments = ["IT", "Finance"];
	const init_roles = ["Requester", "Supporter"];
	const init_users = [{ user_name: "request", password: "test" }, {
		user_name: "support",
		password: "test",
	}];
	// const init_actions = [
	// 	"create_user",
	// 	"modify_user",
	// 	"delete_user",
	// 	"create_department",
	// 	"modify_department",
	// 	"delete_department",
	// 	"create_role",
	// 	"modify_role",
	// 	"delete_role",
	// 	"accept_ticket",
	// 	"close_ticket",
	// ];
	// add admin values
	const admin_username = Deno.env.get("DB_DEFAULT_ADMIN_USERNAME")!;
	const admin_dept = "System_Administration";
	const admin_role = {
		role_name: "Administrators",
		department: "System_Administration",
	};

	// TO DO: proper Error
	if (!database.db_conn.open) {
		return null;
	}
	// only checks for empty table, possible cause for failure if db is initialized elswhere
	if (_rowCounter("departments") == 0) {
		database.addDepartment(admin_dept);
		init_departments.forEach((el) => {
			database.addDepartment(el);
		});
	}
	if (_rowCounter("roles") == 0) {
		const depts = database.getDepartments();
		// console.log("role depts: " + JSON.stringify(depts));
		if (!(depts instanceof Error)) {
			depts.forEach((department) => {
				// console.log("dept loop: " + department.department_name);

				if (department.department_name == admin_dept) {
					//   console.log("admin dept: " + department.department_name);

					database.addRole(admin_role.role_name, department.department_id);
				} else {
					init_roles.forEach((role) => {
						if (department.department_name !== admin_dept) {
							//   console.log(
							//     "added role" + role + "\nto dept: " +
							//       department.department_name,
							//   );
							database.addRole(role, department.department_id);
						}
					});
				}
			});
		}
	}
	if (_rowCounter("users") == 0) {
		const h = hash(
			AlgorithmName.Argon2,
			Deno.env.get("DB_DEFAULT_ADMIN_PASSWORD")!,
		);
		database.addUser(admin_username, h);
		const admin_user_id = database.getUserByUsername(admin_username)!;
		const admin_dept_id = database.getDepartmentIdByName(admin_dept)!;
		if (
			!(admin_dept_id instanceof Error) && !(admin_user_id instanceof Error)
		) {
			const admin_role_id = database.getRoleId(
				admin_role.role_name,
				admin_dept_id.department_id,
			)!;
			//   console.log(
			//     "Admin init:\n" + "id: " + admin_user_id.pk_user_id + "\nrole: " +
			//       admin_role.role_name + "\nrole_id: " + admin_role_id + "\ndept: " +
			//       admin_dept_id.pk_department_id,
			//   );
			if (!(admin_role_id instanceof Error)) {
				database.addUserToDepartment(
					admin_user_id.pk_user_id,
					admin_dept_id.department_id,
					admin_role_id,
				);
			}
		}
		const depts = database.getDepartments();
		if (!(depts instanceof Error)) {
			depts.forEach((department) => {
				if (department.department_name == admin_dept) {
					return;
				}
				// console.log(JSON.stringify(department));

				const d_roles = database.getRolesInDepartment(department.department_id)!;
				init_users.forEach((user) => {
					database.addUser(
						user.user_name,
						hash(
							AlgorithmName.Argon2,
							user.password,
						),
					);
					const db_user = database.getUserByUsername(user.user_name)!;
					console.log("user->dept: " + JSON.stringify(db_user));
					console.log("roles: " + JSON.stringify(d_roles));
					if (!(d_roles instanceof Error) && !(db_user instanceof Error)) {
						const matchin_user_role = d_roles.filter(function (o) {
							console.log(
								"looking for role: " +
									JSON.stringify(o.role_name.toLowerCase()),
							);
							console.log("with user: " + user.user_name.toLowerCase());
							return o.role_name.toLowerCase().includes(
								user.user_name.toLowerCase(),
							);
						})[0];
						console.log(JSON.stringify(matchin_user_role));
						database.addUserToDepartment(
							db_user.pk_user_id,
							department.department_id,
							matchin_user_role.pk_role_id,
						);
					}
				});
			});
		}
	}
	if (_rowCounter("status") == 0) {
		const prep_status_insert = database.db_conn.prepare(
			"INSERT INTO status (pk_status_id,status_name) VALUES (?,?)",
		);
		Object.keys(TicketStatus).filter((key) => isNaN(Number(key))).forEach((key, index) => {
			prep_status_insert.run(index, key);
		});
		prep_status_insert.finalize();
	}
	if (_rowCounter("event_types") == 0) {
		const prep_event_type_insert = database.db_conn.prepare(
			"INSERT INTO event_types (event_type_name) VALUES (?)",
		);
		init_event_types.forEach((el) => {
			prep_event_type_insert.run(el);
		});
		prep_event_type_insert.finalize();
	}
	if (_rowCounter("actions") == 0) {
		const stmt_action_insert = database.db_conn.prepare(
			"INSERT INTO actions (pk_action_id,action_name) VALUES (?,?)",
		);
		Object.values(Actions).forEach((k, v) => {
			if (typeof k === "string") {
				stmt_action_insert.run(v, k);
			}
		});
		stmt_action_insert.finalize();
	}
}

// sadly no parameter binding for tablename possible and therefore string concat as it will not be used outside
function _rowCounter(tablename: string): number {
	const query = "SELECT count(*) as count FROM " + tablename;
	return Object.values(database.db_conn.prepare(query).get()!).at(0) as number;
}
