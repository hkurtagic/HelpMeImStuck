import React, { useContext, useEffect, useState } from "react";
import RequesterSidebarItem from "./RequesterSidebarItem.tsx";
import { ChartArea, LogOut, PanelLeftClose, PanelRightClose, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateTicketForm from "@/components/CreateTicketForm.tsx";
import { EP_logout } from "@/route_helper/routes_helper.tsx";
import StatisticsPage from "@/pages/StatisticsPage.tsx";
import { Department, UUID } from "@shared/shared_types.ts";
import TicketHistory from "@/components/TicketHistory.tsx";
import SupporterTicketOverview from "@/components/SupporterTicketOverview.tsx";
import { UserContext } from "./UserContext.tsx";
import { DashboardProps } from "@/pages/DashboardPage.tsx";

export default function RequesterDashboard(
    { setSelectedDepartment, selectedDepartment }: DashboardProps,
) {
    const [view, setView] = useState<"overview" | "create" | "statistics" | "tickets" | "history">(
        "overview",
    );
    const [isOpen, setIsOpen] = useState(true);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [ticketid, setTicketID] = useState<UUID>();
    const navigate = useNavigate();

    const { user } = useContext(UserContext);
    // Sidebar-Toggle
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    // logout functionality
    const handleLogout = async () => {
        try {
            console.log("Logging out...");

            const response = await fetch(EP_logout, {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Failed to logout from server");
            }

            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    // get departments from backend
    useEffect(() => {
        // fetch(EP_department, {
        //     method: "GET",
        //     headers: appendAuthHeader(),
        // })
        //     .then((res) => {
        //         if (!res.ok) {
        //             throw new Error("Failed to fetch departments");
        //         }
        //         return res.json();
        //     })
        //     .then((data) => {
        //         setDepartments(data);
        //     })
        //     .catch((error) => {
        //         console.error("Error fetching departments:", error);
        //     });
        setDepartments(user.roles.map((r) => r.department));
        // setSelectedDepartment(user.roles[0].department);
    }, [user.roles]);

    return (
        <div className="flex w-screen h-screen overflow-hidden">
            {/* Mobile Sidebar Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={`md:hidden fixed top-5 left-5 z-50 p-2 ${
                    isOpen ? "text-black bg-white" : "bg-fuchsia-500 text-white"
                } focus:outline-none`}
            >
                {isOpen
                    ? <PanelRightClose size={30} className="text-black" />
                    : <PanelLeftClose size={30} className="text-white" />}
            </button>

            {/* Mobile Sidebar */}
            {isOpen && (
                <div className="md:hidden fixed w-3/4 left-0 top-0 h-screen bg-white text-black z-40 overflow-auto rounded-r-3xl">
                    <div className="mt-16 p-4">
                        {/* Dropdown für Departments */}
                        {isOpen && (
                            <div className="p-4">
                                <label
                                    htmlFor="department-select"
                                    className="block text-black font-medium mb-2"
                                >
                                    Select your Department
                                </label>
                                <select
                                    id="department-select"
                                    value={selectedDepartment?.department_name || ""}
                                    onChange={(e) =>
                                        setSelectedDepartment(
                                            departments.find((d) =>
                                                d.department_name == e.target.value
                                            ) ||
                                                null,
                                        )}
                                    className="w-full p-2 border rounded-md bg-white text-black"
                                >
                                    <option value="" disabled>
                                        Choose a department
                                    </option>
                                    {departments.map((dept) => (
                                        <option
                                            key={dept.department_id}
                                            value={dept.department_name}
                                        >
                                            {dept.department_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <RequesterSidebarItem icon={Ticket} label="Home" isOpen={true} />
                        <RequesterSidebarItem icon={ChartArea} label="Statistics" isOpen={true} />
                        <RequesterSidebarItem
                            icon={LogOut}
                            label="Log Out"
                            isOpen={true}
                            onClick={handleLogout}
                        />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div
                className={`
                    hidden md:flex flex-col bg-white text-white h-screen
                    transition-all duration-300 fixed top-0 left-0 z-30
                    ${isOpen ? "w-64 rounded-r-3xl" : "w-16 rounded-r-3xl"}
                `}
            >
                {/* Sidebar Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className={isOpen
                        ? "group flex m-8 p-0 w-max bg-white focus:outline-none"
                        : "group mx-auto p-0 w-max mt-8 bg-white focus:outline-none"}
                >
                    {isOpen
                        ? (
                            <PanelLeftClose
                                size={30}
                                className="text-black group-hover:text-fuchsia-900"
                            />
                        )
                        : (
                            <PanelRightClose
                                size={30}
                                className="text-black group-hover:text-fuchsia-900"
                            />
                        )}
                </button>

                {/* Dropdown für Departments */}
                {isOpen && (
                    <div className="p-4">
                        <label // htmlFor="department-select"
                         className="block text-black font-medium bg-white mb-2">
                            Select a Department
                        </label>
                        <select
                            id="department-select"
                            value={selectedDepartment?.department_name || ""}
                            onChange={(e) =>
                                setSelectedDepartment(
                                    departments.find((d) => d.department_name == e.target.value) ||
                                        null,
                                )}
                            className="w-full p-2 border rounded-md bg-white text-black"
                        >
                            <option value="" disabled>
                                Select a department
                            </option>
                            {departments.map((dept) => (
                                <option key={dept.department_id} value={dept.department_name}>
                                    {dept.department_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Sidebar Elements */}
                <div className="m-4">
                    <RequesterSidebarItem
                        icon={Ticket}
                        label="Tickets"
                        isOpen={isOpen}
                        onClick={() => setView("tickets")}
                    />
                    <RequesterSidebarItem
                        icon={ChartArea}
                        label="Statistics"
                        isOpen={isOpen}
                        onClick={() => setView("statistics")}
                    />
                    <RequesterSidebarItem
                        icon={LogOut}
                        label="Log Out"
                        isOpen={isOpen}
                        onClick={handleLogout}
                    />
                </div>
            </div>

            {/* Dashboard Content */}
            <div
                className={`flex-1 overflow-auto p-5 transition-all duration-300 ${
                    isOpen ? "md:ml-64" : "md:ml-16"
                }`}
            >
                {view === "overview" && (
                    <SupporterTicketOverview
                        setView={setView}
                        selectedDepartment={selectedDepartment}
                        setTicketID={setTicketID}
                    />
                )}
                {view === "create" && <CreateTicketForm setView={setView} />}
                {view === "statistics" && <StatisticsPage />}
                {view === "tickets" && (
                    <SupporterTicketOverview
                        setView={setView}
                        selectedDepartment={selectedDepartment}
                        setTicketID={setTicketID}
                    />
                )}
                {view === "history" && <TicketHistory ticket_id={ticketid!} setView={setView} />}
            </div>
        </div>
    );
}
