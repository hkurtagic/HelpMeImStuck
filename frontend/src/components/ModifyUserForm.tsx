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
    const [selectedDepartments, setSelectedDepartments] = useState<number[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [allRoles, setAllRoles] = useState<Record<number, RoleAdmin[]>>([]);
    const [availableRoles, setAvailableRoles] = useState<RoleAdmin[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);

    useEffect(() => {
        fetchDepartments();
        fetchUserData();
    }, []);
    useEffect(() => {
        if (selectedDepartment && Object.keys(allRoles).length) {
            setAvailableRoles(allRoles[selectedDepartment.department_id]);
        }
    }, [selectedDepartment, availableRoles]);

    // Lade Abteilungen
    const fetchDepartments = async () => {
        try {
            const response = await fetch(EP_department, {
                method: "GET",
                credentials: "include",
                headers: appendAuthHeader(),
            });

            if (!response.ok) throw new Error("Failed to fetch departments");

            const data = await response.json() as Department[];
            setDepartments(Array.isArray(data) ? data : []);
            for (const d of data) {
                fetchRolesByDepartment(d.department_id);
            }
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
            setPassword("");

            // **Extract department and roles from user data**
            if (data.roles.length > 0) {
                const department = data.roles[0].department;
                setSelectedDepartment(department);
                setSelectedRoles(data.roles.map((role: RoleAdmin) => role.role_id));
                setAvailableRoles(data.roles);
                // Lade alle Rollen dieses Departments
                // fetchRolesByDepartment(department.department_id);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    // Lade alle Rollen eines Departments
    const fetchRolesByDepartment = async (departmentId: number) => {
        try {
            const response = await fetch(`${EP_roles_by_department}/${departmentId}`, {
                method: "GET",
                credentials: "include",
                headers: appendAuthHeader(),
            });

            if (!response.ok) throw new Error("Failed to fetch roles");

            const data = await response.json() as RoleAdmin[];
            setAllRoles((prevRoles) => {
                prevRoles[departmentId] = data;
                console.log(prevRoles);
                return prevRoles;
            });
        } catch (error) {
            console.error("Error fetching roles:", error);
        }
    };

    // Department-Checkbox ändern
    const handleDepartmentChange = (departmentId: number) => {
        setSelectedDepartments((prev) => {
            const newSelection = prev.includes(departmentId)
                ? prev.filter((id) => id !== departmentId)
                : [...prev, departmentId];

            // Lade Rollen für neues Department
            if (!prev.includes(departmentId)) {
                fetchRolesByDepartment(departmentId);
            } else {
                // Entferne Rollen, die nur zu diesem Department gehören
                setSelectedRoles((prevRoles) =>
                    prevRoles.filter((roleId) =>
                        availableRoles.some(
                            (r) =>
                                r.role_id === roleId && r.department.department_id !== departmentId,
                        )
                    )
                );
            }
            return newSelection;
        });
    };

    // Role-Checkbox ändern
    const handleRoleChange = (roleId: number) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
        );
    };

    const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedDept = departments.find((d) => d.department_name === e.target.value) || null;
        setSelectedDepartment(selectedDept);
        // setSelectedRoles([]); // Rollen zurücksetzen, wenn ein neues Department gewählt wird
        // setSelectedRoles(selectedUser!.roles.map((role: RoleAdmin) => role.role_id));

        // if (selectedDept) {
        //     fetchRolesByDepartment(selectedDept.department_id);
        // }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username) {
            alert("Username is required!");
            return;
        }
        if (selectedDepartments.length === 0) {
            alert("Please select at least one department.");
            return;
        }

        Object.values(allRoles);
        const selectedRoleObjects = Object.values(allRoles).flatMap((o) => {
            return o.filter((r) => {
                if (selectedRoles.some((selected_rid) => selected_rid === r.role_id)) {
                    return r;
                }
            });
        });
        const modifiedUser: User = {
            user_id: userId.toString(),
            user_name: username,
            ...(password !== "" && { password }),
            roles: selectedRoleObjects.map((role) => ({
                role_id: role.role_id,
                role_name: role.role_name,
                role_description: role.role_description,
                department: role.department,
                actions: role.actions,
            })),
        };

        // console.log("Submitting modified user:", JSON.stringify(modifiedUser, null, 2));

        try {
            if (!selectedRoleObjects.length) throw new Error("User must have at least one Role!");
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
                    <Button
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => setView("overview")}
                    >
                        Back
                    </Button>
                    <CardTitle className="text-2xl text-center">Modify User: {username}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <Label>Username</Label>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <Label>Password (leave empty to keep current)</Label>
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="mb-4">
                            <Label>Departments</Label>
                            {departments.map((dept) => (
                                <label key={dept.department_id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedDepartments.includes(dept.department_id)}
                                        onChange={() =>
                                            handleDepartmentChange(dept.department_id)}
                                    />
                                    <span className="ml-2">{dept.department_name}</span>
                                </label>
                            ))}
                        </div>

                        <div className="mb-4">
                            <Label>Roles</Label>
                            <div className="flex flex-col">
                                {availableRoles
                                    ? availableRoles.map((role) => (
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
                                    ))
                                    : <></>}
                            </div>
                        </div>

                        <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
