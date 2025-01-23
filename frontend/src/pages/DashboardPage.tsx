import { useContext, useEffect, useState } from "react";
import RequesterDashboard from "@/components/RequesterDashboard.tsx";
import SupporterDashboard from "@/components/SupporterDashboard.tsx";
import AdminDashboard from "@/components/AdminDashboard.tsx";
import { UserContext } from "@/components/UserContext";
import { useNavigate } from "react-router-dom";
import { rootPath } from "@/route_helper/routes_helper";

export default function DashboardPage() {
    const [userRole, setUserRole] = useState<string | null>(null);
    const { updateUser } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/api/user")
            .then((res) => res.json())
            .then((data) => {
                if (data.roles && data.roles.length > 0) {
                    const roleName = data.roles[0].role_name; // Erste Rolle extrahieren
                    setUserRole(roleName);
                    updateUser(data);
                } else {
                    navigate(rootPath);
                    // setUserRole("unknown"); // Falls keine Rolle existiert
                }
            })
            .catch((err) => {
                console.error("Fehler beim Laden der Benutzerdaten:", err);
            });
    }, []);

    if (!userRole) {
        return <p>Loading...</p>;
    }

    return (
        <div className="w-screen min-h-screen overflow-auto bg-gradient-to-bl from-fuchsia-800 to-blue-700 bg-fixed">
            {userRole === "Administrator" && <AdminDashboard />}
            {userRole === "Supporter" && <SupporterDashboard />}
            {userRole === "Requester" && <RequesterDashboard />}
            {/* {userRole === "unknown" && <p>No role found.</p>} */}
        </div>
    );
}
