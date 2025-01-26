import { useContext, useEffect, useState } from "react";
import RequesterDashboard from "@/components/RequesterDashboard.tsx";
import SupporterDashboard from "@/components/SupporterDashboard.tsx";
import AdminDashboard from "@/components/AdminDashboard.tsx";
import { UserContext } from "@/components/UserContext";
import { useNavigate } from "react-router-dom";
import { rootPath } from "@/route_helper/routes_helper";
import { Actions, Department, RoleAdmin, User } from "@shared/shared_types";

export interface DashboardProps {
    setSelectedDepartment: React.Dispatch<React.SetStateAction<Department | null>>;
    selectedDepartment: Department | null;
}

export default function DashboardPage() {
    const [userRole, setUserRole] = useState<RoleAdmin | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const { user, updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    const fetchUser = async () => {
        await fetch("/api/user")
            .then((res) => res.json())
            .then((data: User) => {
                if (data.roles && data.roles.length > 0) {
                    setUserRole(data.roles[0]);
                    updateUser(data);
                    setSelectedDepartment(data.roles[0].department);
                } else {
                    navigate(rootPath);
                    // setUserRole("unknown"); // Falls keine Rolle existiert
                }
            })
            .catch((err) => {
                console.error("Fehler beim Laden der Benutzerdaten:", err);
            });
    };

    useEffect(() => {
        if (!user.user_id) {
            fetchUser();
        }
        if (userRole?.department.department_id !== selectedDepartment?.department_id) {
            setUserRole(
                user.roles.find((r) =>
                    r.department.department_id === selectedDepartment?.department_id
                )!,
            );
        }
    }, [fetchUser, selectedDepartment?.department_id, user.user_id]);

    function dashboardSelection() {
        if (
            (userRole?.actions.includes(Actions.user_manage) &&
                userRole.actions.includes(Actions.role_manage) &&
                userRole.actions.includes(Actions.role_manage))
        ) {
            return <AdminDashboard />;
        } else if (userRole?.actions.includes(Actions.ticket_seeDepartmentTickets)) {
            return (
                <SupporterDashboard
                    selectedDepartment={selectedDepartment}
                    setSelectedDepartment={setSelectedDepartment}
                />
            );
        } else {
            return (
                <RequesterDashboard
                    selectedDepartment={selectedDepartment}
                    setSelectedDepartment={setSelectedDepartment}
                />
            );
        }
    }

    // if (!userRole) {
    //     return <p>Loading...</p>;
    // }

    return (
        <div className="w-screen min-h-screen overflow-auto bg-gradient-to-bl from-fuchsia-800 to-blue-700 bg-fixed">
            {(user.user_id) ? dashboardSelection() : <></>}
            {/* {userRole === "unknown" && <p>No role found.</p>} */}
        </div>
    );
}
