import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
    appendAuthHeader,
    EP_department,
    EP_roles_by_department,
} from "@/route_helper/routes_helper.tsx";
import { Department, RoleAdmin, User } from "@shared/shared_types.ts";

interface ModifyUserProps {
    setView: (view: "overview") => void;
    userId: number;
}

export default function ModifyUserForm({ setView, userId }: ModifyUserProps) {
    const [username, setUsername] = useState<string>("");
    const [selectedUser, setSelectedUser] = useState<User>();
    const [password, setPassword] = useState<string>("");
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [availableRoles, setAvailableRoles] = useState<RoleAdmin[]>([]);

    useEffect(() => {
        fetchDepartments();
        fetchUserData();
    }, []);

    // Lade Abteilungen
    const fetchDepartments = async () => {
        try {
            const response = await fetch(EP_department, {
                method: "GET",
                credentials: "include",
                headers: appendAuthHeader(),
            });

            if (!response.ok) throw new Error("Failed to fetch departments");

            const data = await response.json();
            setDepartments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching departments:", error);
            setDepartments([]);
        }
    };

    // Lade User-Daten
    const fetchUserData = async () => {
        try {
            const response = await fetch(`/api/user/${userId}`, {
                method: "GET",
                credentials: "include",
                headers: appendAuthHeader(),
            });

            if (!response.ok) throw new Error("Failed to fetch user data");

            const data = await response.json() as User;
            setSelectedUser(data);
            setUsername(data.user_name);
            setPassword(""); // Passwort muss neu gesetzt werden

            // **Extract department and roles from user data**
            if (data.roles.length > 0) {
                const department = data.roles[0].department;
                setSelectedDepartment(department);
                setSelectedRoles(data.roles.map((role: RoleAdmin) => role.role_id));

                // Lade alle Rollen dieses Departments
                fetchRolesByDepartment(department.department_id);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // Lade alle Rollen des ausgewählten Departments
    const fetchRolesByDepartment = async (departmentId: number) => {
        try {
            const response = await fetch(`${EP_roles_by_department}/${departmentId}`, {
                method: "GET",
                credentials: "include",
                headers: appendAuthHeader(),
            });

            if (!response.ok) throw new Error("Failed to fetch roles");

            const data = await response.json() as RoleAdmin[];
            setAvailableRoles(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching roles:", error);
            setAvailableRoles([]);
        }
    };

    const handleRoleChange = (roleId: number) => {
        setSelectedRoles((prevSelected) =>
            prevSelected.includes(roleId)
                ? prevSelected.filter((role) => role !== roleId)
                : [...prevSelected, roleId]
        );
    };

    const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedDept = departments.find((d) => d.department_name === e.target.value) || null;
        setSelectedDepartment(selectedDept);
        // setSelectedRoles([]); // Rollen zurücksetzen, wenn ein neues Department gewählt wird
        // setSelectedRoles(selectedUser!.roles.map((role: RoleAdmin) => role.role_id));

        if (selectedDept) {
            fetchRolesByDepartment(selectedDept.department_id);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username) {
            alert("Username is required!");
            return;
        }
        if (!selectedDepartment) {
            alert("Please select a department.");
            return;
        }

        const selectedRoleObjects = availableRoles.filter((role) =>
            selectedRoles.includes(role.role_id)
        );

        const modifiedUser: User = {
            user_id: userId.toString(),
            user_name: username,
            ...(password !== "" && { password }), // Falls leer, wird das Feld nicht gesendet
            roles: selectedRoleObjects.map((role) => ({
                role_id: role.role_id,
                role_name: role.role_name,
                role_description: role.role_description,
                department: {
                    department_id: selectedDepartment.department_id,
                    department_name: selectedDepartment.department_name,
                    department_description: selectedDepartment.department_description,
                },
                actions: role.actions,
            })),
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

            alert("User modified successfully!");
            setView("overview");
        } catch (error) {
            console.error("Error modifying user:", error);
            alert("Error modifying user. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full md:w-2/3 lg:w-1/2 shadow-lg">
                <CardHeader>
                    <div className="flex flex-row justify-between">
                        <Button
                            className="bg-red-500 hover:bg-red-600 w-1/5"
                            onClick={() => setView("overview")}
                        >
                            Back
                        </Button>
                    </div>
                    <CardTitle className="text-2xl text-center">Modify User: {username}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full p-2 border rounded-md"
                            />
                        </div>

                        <div className="mb-4">
                            <Label htmlFor="password">New Password (or leave empty)</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded-md"
                            />
                        </div>

                        <div className="mb-4">
                            <Label>Department</Label>
                            <select
                                value={selectedDepartment?.department_name || ""}
                                onChange={handleDepartmentChange}
                                className="border border-black p-2 rounded-md w-full"
                            >
                                <option value="" disabled>Select a department</option>
                                {departments.map((dept) => (
                                    <option key={dept.department_id} value={dept.department_name}>
                                        {dept.department_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <Label>Roles</Label>
                            <div className="flex flex-col">
                                {availableRoles.map((role) => (
                                    <label
                                        key={role.role_id}
                                        className="flex items-center space-x-2"
                                    >
                                        <input
                                            type="checkbox"
                                            value={role.role_id}
                                            checked={selectedRoles.includes(role.role_id)}
                                            onChange={() => handleRoleChange(role.role_id)}
                                            className="form-checkbox"
                                        />
                                        <span>{role.role_name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 w-1/5">
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
