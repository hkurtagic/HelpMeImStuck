// paths
const hostPath = "${window.location.origin}";
const rootPath = "/";
const dashboardPath = "/dashboard";
const ticketHistoryPath = "/ticket_history";

// endpoints
const EP_department = "/api/department";
const EP_own_department = EP_department + "/own";
const EP_ticket = "/api/ticket";
const EP_department_tickets = (department_id: number) => `${EP_ticket}/${department_id}`;
const EP_ticket_create = EP_ticket; // + "/";
const EP_login = "/api/login";

const EP_logout = "/api/logout";

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
