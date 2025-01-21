// AdminOverview.tsx

import React, { useEffect, useState } from "react";
import {
    appendAuthHeader,
    EP_department,
    EP_users_of_selected_department,
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
    setMaxUserId: (id: number) => void;  // Neue Prop zum Setzen der maximalen User ID
    setSelectedUserId: (id: number) => void;

}

export default function AdminOverview({ setView, setMaxUserId, setSelectedUserId }: CreateUserProps) {
    const [users, setUsers] = useState<ProcessedUser[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

    // Fetch users when the selected department changes
    useEffect(() => {
        if (selectedDepartment) {
            fetchDepartmentUser(selectedDepartment.department_id);
        } else {
            fetchDepartments(); // Fetch all departments on component mount
            setUsers([]); // Clear users if no department is selected
        }
    }, [selectedDepartment]);

    useEffect(() => {
        // maximale User ID calculaten und setzen
        if (users.length > 0) {
            const maxId = Math.max(...users.map((user) => user.id));
            setMaxUserId(maxId); // Weitergabe der maximalen ID an die CreateUserForm
        }
    }, [users]);

    const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedDept = departments.find((d) => d.department_name === e.target.value) || null;
        setSelectedDepartment(selectedDept);
    };

    const handleModify = (userId: number) => {
        setSelectedUserId(userId);
        setView("userModify");
    };

    // Fetch ALL Departments
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

    // Fetch ALL Users of a department
    const fetchDepartmentUser = async (departmentId: number) => {
        try {
            const response = await fetch(`${EP_users_of_selected_department}/${departmentId}`, {
                method: "GET",
                credentials: "include",
                headers: appendAuthHeader(),
            });

            if (!response.ok) throw new Error("Failed to fetch users for the selected department");

            const data = await response.json();

            // Transform the API response into a flat structure
            const processedUsers = Object.values(data).map((user: any) => ({
                id: user.user_id,
                name: user.user_name,
                roles: user.roles.map((role: any) => ({
                    role: role.role_name || "No Role",
                    department: role.department?.department_name || "No Department",
                })),
            }));

            // Filter users based on selected department
            const filteredUsers = processedUsers.filter(user =>
                user.roles.some(role => role.department === selectedDepartment?.department_name)
            );

            setUsers(filteredUsers);
        } catch (error) {
            console.error("Error fetching users for the selected department:", error);
        }
    };


    // Delete User
    const deleteUser = async (userId: number) => {
        try {
            const response = await fetch(`/api/user/${userId}`, {
                method: "DELETE",
                credentials: "include",
                headers: appendAuthHeader(),
            });

            if (!response.ok) {
                throw new Error(`Failed to delete user with ID ${userId}`);
            }

            // Entfernen des gelöschten Benutzers aus der lokalen Users-Liste
            setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
            alert(`User with ID ${userId} has been deleted successfully.`);
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user. Please try again.");
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

            {/* Add User Button positioned above the table */}
            <div className="w-full flex justify-end mt-4">
                <Button
                    className="bg-green-500 md:w-1/12 font-bold hover:bg-green-600"
                    onClick={() => setView("userCreate")}
                >
                    Add User
                </Button>
            </div>

            {users.length > 0 && (
                <>


                    {/* Users Table */}
                    <table className="w-full border border-gray-800 mt-5">
                        <thead>
                        <tr>
                            <th className="border border-gray-800 p-2 bg-slate-300">User ID</th>
                            <th className="border border-gray-800 p-2 bg-slate-300">Name</th>
                            <th className="border border-gray-800 p-2 bg-slate-300">Role</th>
                            <th className="border border-gray-800 p-2 bg-slate-300">Department</th>
                            <th className="border border-gray-800 p-2 bg-slate-300">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) =>
                            user.roles.map((role, index) => (
                                role.department === selectedDepartment?.department_name && (
                                    <tr key={`${user.id}-${role.role}-${index}`}>
                                        <td className="border border-gray-800 p-2 bg-white">{user.id}</td>
                                        <td className="border border-gray-800 p-2 bg-white">{user.name}</td>
                                        <td className="border border-gray-800 p-2 bg-white">{role.role}</td>
                                        <td className="border border-gray-800 p-2 bg-white">{role.department}</td>
                                        <td className="border border-gray-800 p-2 bg-white space-x-2">
                                            <button
                                                onClick={() => deleteUser(user.id)}
                                                className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-md"
                                            >
                                                Delete
                                            </button>
                                            <button
                                                onClick={() => handleModify(user.id)}
                                                className="p-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md"
                                            >
                                                Modify
                                            </button>
                                        </td>
                                    </tr>
                                )
                            ))
                        )}
                        </tbody>
                    </table>
                </>
            )}
            {users.length === 0 && <p className="text-white mt-5">There are no users in this department.</p>}
        </div>
    );
}
