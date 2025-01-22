import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { appendAuthHeader, EP_department, EP_roles_by_department } from "@/route_helper/routes_helper.tsx";
import { Actions, Department, Role, UserCreate } from "@shared/shared_types.ts";

interface CreateUserProps {
    setView: (view: "overview" | "userCreate") => void;
    maxUserId: number | null;
}

export default function CreateUserForm({ setView, maxUserId }: CreateUserProps) {
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
    const [userId, setUserId] = useState<number>(maxUserId ? maxUserId + 1 : 1);

    useEffect(() => {
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (selectedDepartment) {
            fetchRolesByDepartment(selectedDepartment.department_id);
        } else {
            setAvailableRoles([]); // Rollen zurücksetzen, wenn kein Department gewählt wurde
        }
    }, [selectedDepartment]);

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

    const fetchRolesByDepartment = async (departmentId: number) => {
        try {
            const response = await fetch(`${EP_roles_by_department}/${departmentId}`, {
                method: "GET",
                credentials: "include",
                headers: appendAuthHeader(),
            });

            if (!response.ok) throw new Error("Failed to fetch roles");

            const data = await response.json();
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
        setSelectedRoles([]); // Rollen zurücksetzen, wenn ein neues Department gewählt wird
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            alert("Username and password are required!");
            return;
        }
        if (!selectedDepartment) {
            alert("Please select a department.");
            return;
        }
        if (selectedRoles.length === 0) {
            alert("Please select at least one role.");
            return;
        }

        const selectedRoleObjects = availableRoles.filter((role) => selectedRoles.includes(role.role_id));

        const newUser: UserCreate = {
            user_name: username,
            password: password,
            roles: selectedRoleObjects.map(role => ({
                ...role,
                department: selectedDepartment,
            })),
        };

        console.log("Submitting new user:", JSON.stringify(newUser, null, 2));

        try {
            const response = await fetch("/api/user", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    ...appendAuthHeader(),
                },
                body: JSON.stringify(newUser),
            });

            if (!response.ok) throw new Error("Failed to create user");

            alert("User created successfully!");
            setUserId(userId + 1);
            setUsername("");
            setPassword("");
            setSelectedRoles([]);
            setSelectedDepartment(null);
            setView("overview");
        } catch (error) {
            console.error("Error creating user:", error);
            alert("Error creating user. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full md:w-2/3 lg:w-1/2 shadow-lg">
                <CardHeader>
                    <div className="flex flex-row justify-between">
                        <Button className="bg-red-500 hover:bg-red-600 w-1/5" onClick={() => setView("overview")}>
                            Back
                        </Button>
                    </div>
                    <CardTitle className="text-2xl text-center">Create a New User</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full p-2 border rounded-md" />
                        </div>

                        <div className="mb-4">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-2 border rounded-md" />
                        </div>

                        <div className="mb-4">
                            <Label>Department</Label>
                            <select value={selectedDepartment?.department_name || ""} onChange={handleDepartmentChange} className="border border-black p-2 rounded-md w-full">
                                <option value="" disabled>Select a department</option>
                                {departments.map((dept) => (
                                    <option key={dept.department_id} value={dept.department_name}>
                                        {dept.department_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedDepartment && (
                            <div className="mb-4">
                                <Label>Roles</Label>
                                <div className="flex flex-col">
                                    {availableRoles.length > 0 ? (
                                        availableRoles.map((role) => (
                                            <label key={role.role_id} className="flex items-center space-x-2">
                                                <input type="checkbox" value={role.role_id} checked={selectedRoles.includes(role.role_id)} onChange={() => handleRoleChange(role.role_id)} className="form-checkbox" />
                                                <span>{role.role_name}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">No roles available for this department.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 w-1/5">Create User</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
