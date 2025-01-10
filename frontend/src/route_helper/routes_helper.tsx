// paths
const hostPath = "${window.location.origin}";
const rootPath = "/";
const dashboard = "/dashboard";
const ticketHistory = "/ticket_history";

// endpoints
const EP_department = "/api/department";
const EP_ticket = "/api/ticket";
const EP_ticket_create = EP_ticket + "/create";
const EP_login = "/api/login";

const EP_logout = "/api/logout";

export {
	dashboard,
	EP_department,
	EP_login,
	EP_logout,
	EP_ticket,
	EP_ticket_create,
	hostPath,
	rootPath,
	ticketHistory,
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
