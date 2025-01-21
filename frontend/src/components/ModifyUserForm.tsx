import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { appendAuthHeader, EP_department } from "@/route_helper/routes_helper.tsx";
import { Actions, Department } from "@shared/shared_types.ts";

interface ModifyUserProps {
    setView: (view: "overview") => void;
    userId: number;
}

interface RoleOption {
    value: number;
    label: string;
    actions: Actions[];
}

export default function ModifyUserForm({ setView, userId }: ModifyUserProps) {
    const [username, setUsername] = useState<string>("");
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);

    useEffect(() => {
        fetchDepartments();
        fetchUserData();
    }, []);

    // Lade alle verfügbaren Abteilungen
    const fetchDepartments = async () => {
        try {
            const response = await fetch(EP_department, {
                method: "GET",
                credentials: "include",
                headers: appendAuthHeader(),
            });

            if (!response.ok) throw new Error("Failed to fetch departments");

            const data: Department[] = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    // Lade die User-Daten
    const fetchUserData = async () => {
        try {
            const response = await fetch(`/api/user/${userId}`, {
                method: "GET",
                credentials: "include",
                headers: appendAuthHeader(),
            });

            if (!response.ok) throw new Error("Failed to fetch user data");

            const data = await response.json();
            setUsername(data.user_name);

            // Falls keine Rollen oder Departments existieren, setze sie auf leere Listen
            setSelectedRoles(data.roles ? data.roles.map((role: any) => role.role_id) : []);
            setSelectedDepartments(data.roles ? data.roles.map((role: any) => role.department.department_name) : []);
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // Ändere die Auswahl der Rollen
    const handleRoleChange = (value: number) => {
        setSelectedRoles((prevSelected) =>
            prevSelected.includes(value)
                ? prevSelected.filter((role) => role !== value)
                : [...prevSelected, value]
        );
    };

    // Ändere die Auswahl der Departments
    const handleDepartmentChange = (value: string) => {
        setSelectedDepartments((prevSelected) =>
            prevSelected.includes(value)
                ? prevSelected.filter((dept) => dept !== value)
                : [...prevSelected, value]
        );
    };

    // Speichert die geänderten Daten
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("Modified User:", username);
        console.log("Selected Roles:", selectedRoles);
        console.log("Selected Departments:", selectedDepartments);

        const selectedRoleDetails = selectedRoles.map((roleId) =>
            roleOptions.find((option) => option.value === roleId)
        ).filter(Boolean) as RoleOption[];

        if (selectedRoleDetails.length === 0) {
            console.error("No valid roles selected.");
            return;
        }

        const selectedDepartmentObjects = departments.filter((dept) =>
            selectedDepartments.includes(dept.department_name)
        );

        if (selectedDepartmentObjects.length === 0) {
            console.error("No department selected or invalid department.");
            return;
        }

        // Erstellt die Rollenstruktur mit den ausgewählten Rollen und Departments
        const roles = selectedRoleDetails.flatMap((roleDetails) =>
            selectedDepartmentObjects.map((dept) => ({
                role_id: roleDetails.value,
                role_name: roleDetails.label,
                role_description: `Description for ${roleDetails.label}`,
                department: {
                    department_id: dept.department_id,
                    department_name: dept.department_name,
                    department_description: dept.department_description,
                },
                actions: roleDetails.actions,
            }))
        );

        const modifiedUser = {
            user_id: userId.toString(),
            user_name: username,
            roles: roles,
        };

        console.log("Submitting modified user:", JSON.stringify(modifiedUser, null, 2));

        try {
            const response = await fetch(`/api/user/${userId}`, {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...appendAuthHeader(),
                },
                body: JSON.stringify(modifiedUser),
            });

            if (!response.ok) throw new Error("Failed to modify user");

            setView("overview");
        } catch (error) {
            console.error("Error modifying user:", error);
        }
    };

    // Definiert die Rollenoptionen
    const roleOptions: RoleOption[] = [
        { value: 1, label: "Requester", actions: [Actions.ticket_create, Actions.ticket_pullBack, Actions.ticket_closeOwn] },
        { value: 4, label: "Supporter", actions: [Actions.ticket_create, Actions.ticket_pullBack, Actions.ticket_seeDepartmentTickets, Actions.ticket_accept, Actions.ticket_close, Actions.ticket_forward] },
        { value: 5, label: "Administrator", actions: Object.values(Actions).filter((v) => typeof v === "number") as Actions[] },
    ];

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full md:w-2/3 lg:w-1/2 shadow-lg">
                <CardHeader>
                    <div className="flex flex-row justify-between">
                        <Button className="bg-red-500 hover:bg-red-600 w-1/5" onClick={() => setView("overview")}>
                            Back
                        </Button>
                    </div>
                    <CardTitle className="text-2xl text-center">Modify User</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-2 border rounded-md" />
                        </div>

                        <div className="mb-4">
                            <Label>Roles</Label>
                            <div className="flex flex-col">
                                {roleOptions.map((role) => (
                                    <label key={role.value} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value={role.value}
                                            checked={selectedRoles.includes(role.value)}
                                            onChange={() => handleRoleChange(role.value)}
                                            className="form-checkbox"
                                        />
                                        <span>{role.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <Label>Departments</Label>
                            <div className="flex flex-col">
                                {departments.map((dept) => (
                                    <label key={dept.department_id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value={dept.department_name}
                                            checked={selectedDepartments.includes(dept.department_name)}
                                            onChange={() => handleDepartmentChange(dept.department_name)}
                                            className="form-checkbox"
                                        />
                                        <span>{dept.department_name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 w-1/5">
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
