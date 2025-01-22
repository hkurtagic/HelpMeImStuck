import React, { useEffect, useState } from "react";
import {
    appendAuthHeader,
    EP_department,
    EP_users_of_selected_department,
    EP_roles_by_department,
} from "@/route_helper/routes_helper.tsx";
import { Department } from "@shared/shared_types.ts";
import { Label } from "@/components/ui/label.tsx";
import { Button } from "@/components/ui/button.tsx";

interface ProcessedUser {
    id: number;
    name: string;
    roles: {
        role: string;
        department: string;
    }[];
}

interface CreateUserProps {
    setView: (view: string) => void;
    setMaxUserId: (id: number) => void;
    setSelectedUserId: (id: number) => void;
}

export default function AdminOverview({ setView, setMaxUserId, setSelectedUserId }: CreateUserProps) {
    const [users, setUsers] = useState<ProcessedUser[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [availableRoles, setAvailableRoles] = useState<string[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>("");

    // Fetch departments on mount
    useEffect(() => {
        fetchDepartments();
    }, []);

    // Fetch users and roles when department changes
    useEffect(() => {
        if (selectedDepartment) {
            fetchDepartmentUser(selectedDepartment.department_id);
            fetchRolesByDepartment(selectedDepartment.department_id);
        } else {
            setUsers([]);
            setAvailableRoles([]); // Rollen zurücksetzen
        }
    }, [selectedDepartment, selectedRole]);

    useEffect(() => {
        if (users.length > 0) {
            const maxId = Math.max(...users.map((user) => user.id));
            setMaxUserId(maxId);
        }
    }, [users]);

    const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedDept = departments.find((d) => d.department_name === e.target.value) || null;
        setSelectedDepartment(selectedDept);
        setSelectedRole("");
    };

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedRole(e.target.value);
    };

    const handleModify = (userId: number) => {
        setSelectedUserId(userId);
        setView("userModify");
    };

    // Fetch all departments
    const fetchDepartments = async () => {
        try {
            const response = await fetch(EP_department, {
                method: "GET",
                credentials: "include",
                headers: appendAuthHeader(),
            });

            if (!response.ok) throw new Error("Failed to fetch ALL departments");

            const data = await response.json();
            setDepartments(data);
        } catch (error) {
            console.error("Error fetching ALL departments:", error);
        }
    };

    // ✅ Fetch roles for the selected department
    const fetchRolesByDepartment = async (departmentId: number) => {
        try {
            const response = await fetch(`${EP_roles_by_department}/${departmentId}`, {
                method: "GET",
                credentials: "include",
                headers: appendAuthHeader(),
            });

            if (!response.ok) throw new Error("Failed to fetch roles");

            const data = await response.json();
            console.log("Fetched roles:", data);


            setAvailableRoles(Array.isArray(data) ? data.map(role => role.role_name) : []);
        } catch (error) {
            console.error("Error fetching roles:", error);
            setAvailableRoles([]);
        }
    };

    // Fetch users of the selected department
    const fetchDepartmentUser = async (departmentId: number | null) => {
        try {
            const url = departmentId ? `${EP_users_of_selected_department}/${departmentId}` : EP_users_of_selected_department;

            const response = await fetch(url, {
                method: "GET",
                credentials: "include",
                headers: appendAuthHeader(),
            });

            if (!response.ok) throw new Error("Failed to fetch users");

            const data = await response.json();
            console.log("Fetched users data:", data);

            const processedUsers = Object.values(data).map((user: any) => ({
                id: user.user_id,
                name: user.user_name,
                roles: user.roles?.map((role: any) => ({
                    role: role.role_name || "No Role",
                    department: role.department?.department_name || "No Department",
                })) || [],
            }));

            // **Neue Filter-Logik:**
            const filteredUsers = processedUsers.filter((user) => {
                const matchesDepartment = selectedDepartment
                    ? user.roles.some((role) => role.department === selectedDepartment?.department_name)
                    : true;

                const matchesRole = selectedRole
                    ? user.roles.some((role) => role.role === selectedRole)
                    : true;

                return matchesDepartment && matchesRole;
            });

            setUsers(filteredUsers);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };


    return (
        <div className="p-5 flex flex-col items-center">
            <h1 className="text-center text-white mb-7 font-mono">Admin Dashboard</h1>

            {/* Department Dropdown */}
            <Label className="text-white mb-4">Select a Department to display Users:</Label>
            <select
                value={selectedDepartment?.department_name || ""}
                onChange={handleDepartmentChange}
                className="border border-black p-2 rounded-md w-[500px]"
            >
                <option value="" disabled>Select a department</option>
                {departments.map((dept) => (
                    <option key={dept.department_id} value={dept.department_name}>
                        {dept.department_name}
                    </option>
                ))}
            </select>

            {/* Role Dropdown (Nur Rollen des gewählten Departments) */}
            <Label className="text-white mt-4 mb-4">Select a Role to filter by:</Label>
            <select
                value={selectedRole}
                onChange={handleRoleChange}
                className="border border-black p-2 rounded-md w-[500px]"
                disabled={!selectedDepartment}
            >
                <option value="">Select a role</option>
                {availableRoles.map((role) => (
                    <option key={role} value={role}>
                        {role}
                    </option>
                ))}
            </select>

            {/* Add User Button */}
            <div className="w-full flex justify-end mt-4">
                <Button
                    className="bg-green-500 md:w-1/12 font-bold hover:bg-green-600"
                    onClick={() => setView("userCreate")}
                >
                    Add User
                </Button>
            </div>

            {/* Users Table */}
            {users.length > 0 ? (
                <table className="w-full border border-gray-800 mt-5">
                    <thead>
                    <tr>
                        <th className="border border-gray-800 p-2 bg-slate-300">User ID</th>
                        <th className="border border-gray-800 p-2 bg-slate-300">Name</th>
                        <th className="border border-gray-800 p-2 bg-slate-300">Role</th>
                        <th className="border border-gray-800 p-2 bg-slate-300">Department</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) =>
                        user.roles.map((role, index) => (
                            <tr key={`${user.id}-${role.role}-${index}`}>
                                <td className="border border-gray-800 p-2 bg-white">{user.id}</td>
                                <td className="border border-gray-800 p-2 bg-white">{user.name}</td>
                                <td className="border border-gray-800 p-2 bg-white hover:bg-slate-200 cursor-pointer" onClick={() => {alert("MODIFY OPTION")}}>{role.role}</td>
                                <td className="border border-gray-800 p-2 bg-white">{role.department}</td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            ) : (
                <p className="text-white mt-5">No users found.</p>
            )}
        </div>
    );
}
