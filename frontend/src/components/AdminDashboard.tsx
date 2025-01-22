import React, { useState } from "react";
import RequesterSidebarItem from "./RequesterSidebarItem.tsx";
import { ChartArea, LogOut, PanelLeftClose, PanelRightClose, Ticket,  UsersRound} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatisticsPage from "@/pages/StatisticsPage.tsx";
import AdminOverview from "@/components/AdminOverview.tsx";
import CreateUserForm from "@/components/CreateUserForm.tsx";
import ModifyUserForm from "@/components/ModifyUserForm.tsx";

export default function AdminDashboard() {
    const [view, setView] = useState("overview");
    const [isOpen, setIsOpen] = useState(true);
    const [maxUserId, setMaxUserId] = useState<number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const navigate = useNavigate();

    // Sidebar-Toggle
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    // logout functionality
    const handleLogout = async () => {
        try {
            console.log("Logging out...");

            const response = await fetch("/api/user/logout", {
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



    return (
        <div className="flex w-screen h-screen overflow-hidden">
            {/* Mobile Sidebar Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={`md:hidden fixed top-5 left-5 z-50 p-2 ${
                    isOpen ? "text-black bg-white" : "bg-fuchsia-500 text-white"
                } focus:outline-none`}
            >
                {isOpen ? <PanelRightClose size={30} className="text-black" /> : <PanelLeftClose size={30} className="text-white" />}
            </button>

            {/* Mobile Sidebar */}
            {isOpen && (
                <div className="md:hidden fixed w-3/4 left-0 top-0 h-screen bg-white text-black z-40 overflow-auto rounded-r-3xl">
                    <div className="mt-16 p-4">
                        <RequesterSidebarItem icon={UsersRound} label="Users" isOpen={true} />
                        <RequesterSidebarItem icon={ChartArea} label="Statistics" isOpen={true} />
                        <RequesterSidebarItem icon={LogOut} label="Log Out" isOpen={true} onClick={handleLogout} />
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
                        ? <PanelLeftClose size={30} className="text-black group-hover:text-fuchsia-900" />
                        : <PanelRightClose size={30} className="text-black group-hover:text-fuchsia-900" />}
                </button>



                {/* Sidebar Elements */}
                <div className="m-4">
                    <RequesterSidebarItem icon={UsersRound} label="Users" isOpen={isOpen} onClick={() => setView("overview")} />
                    <RequesterSidebarItem icon={ChartArea} label="Statistics" isOpen={isOpen} onClick={() => setView("statistics")} />
                    <RequesterSidebarItem icon={LogOut} label="Log Out" isOpen={isOpen} onClick={handleLogout} />
                </div>
            </div>

            {/* Dashboard Content */}
            <div className={`flex-1 overflow-auto p-5 transition-all duration-300 ${isOpen ? "md:ml-64" : "md:ml-16"}`}>
                {view === "statistics" && <StatisticsPage />}
                {view === "overview" &&   <AdminOverview setView={setView} setMaxUserId={setMaxUserId} setSelectedUserId={setSelectedUserId}/>}
                {view === "userCreate" && <CreateUserForm setView={setView} maxUserId={maxUserId}/>}
                {view === "userModify" && selectedUserId !== null && <ModifyUserForm setView={setView} userId={selectedUserId} />}

            </div>
        </div>
    );
}
