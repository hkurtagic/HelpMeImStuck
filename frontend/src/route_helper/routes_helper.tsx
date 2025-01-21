// paths
import department from "../../../backend/route/Department.ts";

const hostPath = "${window.location.origin}";
const rootPath = "/";
const dashboardPath = "/dashboard";
const ticketHistoryPath = "/ticket_history";
const statisticsPath = "/statistics";


// endpoints
const EP_department = "/api/department";
const EP_own_department = EP_department + "/own";
const EP_ticket = "/api/ticket";
const EP_department_tickets = (department_id: number) => `${EP_ticket}/${department_id}`;
const EP_ticket_create = EP_ticket; // + "/";

const EP_user = "/api/user";	// GET REQUEST get userdata of current user
const EP_users_of_selected_department = "api/user/dept";	// GET REQUEST get all users of provided department

const EP_login = EP_user + "/login";
const EP_logout = EP_user + "/logout";




// Es gibt einen Role Endpoint den wir auch zum Updaten benutzen
//user/department/:department_id --> gibt alle user eines provided department zurück


export {
	dashboardPath,
	EP_department,
	EP_department_tickets,
	EP_login,
	EP_logout,
	EP_own_department,
	EP_ticket,
	EP_ticket_create,
	hostPath,
	rootPath,
	ticketHistoryPath,
	statisticsPath,
	EP_users_of_selected_department,
	EP_user
};

// helper functions

export function appendAuthHeader(headers?: HeadersInit) {
	if (window.sessionStorage.getItem("Authorization")) {
		return {
			...headers,
			Authorization: window.sessionStorage.getItem("Authorization") as string,
		} as HeadersInit;
	} else {
		return {
			...headers,
		} as HeadersInit;
	}
}