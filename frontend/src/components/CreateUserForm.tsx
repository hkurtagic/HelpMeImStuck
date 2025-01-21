import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { appendAuthHeader, EP_department } from "@/route_helper/routes_helper.tsx";
import { Actions, Department, Role, UserCreate } from "@shared/shared_types.ts";

interface CreateUserProps {
    setView: (view: "overview" | "userCreate") => void;
    maxUserId: number | null;
}

interface RoleOption {
    value: number;
    label: string;
    actions: Actions[];
}

export default function CreateUserForm({ setView, maxUserId }: CreateUserProps) {
    const [username, setUsername] = useState<string>("");
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]); // Mehrere Rollen möglich
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
    const [userId, setUserId] = useState<number>(maxUserId ? maxUserId + 1 : 1);

    useEffect(() => {
        fetchDepartments();
    }, []);

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

    const handleRoleChange = (value: number) => {
        setSelectedRoles((prevSelected) =>
            prevSelected.includes(value)
                ? prevSelected.filter((role) => role !== value)
                : [...prevSelected, value]
        );
    };

    const handleDepartmentChange = (value: string) => {
        setSelectedDepartments((prevSelected) =>
            prevSelected.includes(value)
                ? prevSelected.filter((dept) => dept !== value)
                : [...prevSelected, value]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

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
            } as Role))
        );

        const newUser: UserCreate = {
            user_name: username,
            password: "",
            roles: roles,
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

            setUserId(userId + 1);
            setView("overview");
        } catch (error) {
            console.error("Error creating user:", error);
        }
    };

    const roleOptions: RoleOption[] = [
        {
            value: 1,
            label: "Requester",
            actions: [Actions.ticket_create, Actions.ticket_pullBack, Actions.ticket_closeOwn],
        },
        {
            value: 4,
            label: "Supporter",
            actions: [
                Actions.ticket_create,
                Actions.ticket_pullBack,
                Actions.ticket_seeDepartmentTickets,
                Actions.ticket_accept,
                Actions.ticket_close,
                Actions.ticket_forward,
            ],
        },
        {
            value: 5,
            label: "Administrator",
            actions: Object.values(Actions).filter((v) => typeof v === "number") as Actions[],
        },
    ];

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
                    <CardTitle className="text-2xl text-center">Create a New User</CardTitle>
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
                            <Label>Roles</Label>
                            <div className="flex flex-col">
                                {roleOptions.map((role) => (
                                    <label key={role.value} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            value={role.value}
                                            checked={selectedRoles.includes(role.value)}
                                            onChange={() =>
                                                handleRoleChange(role.value)}
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
                                    <label
                                        key={dept.department_id}
                                        className="flex items-center space-x-2"
                                    >
                                        <input
                                            type="checkbox"
                                            value={dept.department_name}
                                            checked={selectedDepartments.includes(
                                                dept.department_name,
                                            )}
                                            onChange={() =>
                                                handleDepartmentChange(dept.department_name)}
                                            className="form-checkbox"
                                        />
                                        <span>{dept.department_name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <Button type="submit" className="bg-blue-500 hover:bg-blue-600 w-1/5">
                                Create User
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
