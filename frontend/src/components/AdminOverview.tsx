import React, { useEffect, useState } from "react";
import {appendAuthHeader, dashboardPath, EP_department, EP_user_management} from "@/route_helper/routes_helper.tsx";
import { Department, User } from "@shared/shared_types.ts";
import {Label} from "@/components/ui/label.tsx";

export default function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);

    const [selectedRole, setSelectedRole] = useState<{ [key: number]: "Admin" | "User" }>({});
    const [selectedDepartment, setSelectedDepartment] = useState<{ [key: number]: number }>({});


    // Fetching all users
    /*useEffect(() => {
        fetch(EP_user_management, {
            method: "GET",
            headers: appendAuthHeader(),
        })
            .then((res) => {
                console.log(res.json)
                if (!res.ok) {
                    throw new Error("Failed to fetch users from server...")
                }
                return (res.json())
            })
            .then((data) => {setUsers(data)})
            .catch((error) => console.log("error fetching departments... " + error))
    }, [])

     */




    // Fetching all departments
    useEffect(() => {
        fetch(EP_department, {
            method: "GET",
            headers: appendAuthHeader(),
            credentials: "include",

        })
            .then((res) => {
                console.log(res.json())
                if (!res.ok) {
                    throw new Error("Nikyar Failed to fetch departments from server...")
                }
                return (res.json())
            })
            .then ((data) => {setDepartments(data)})
            .catch((error) => console.log("Nikyar Error fetching departments... " + error))
    }, []);



    // Benutzer löschen
   /* async function deleteUser(userId: number) {
        try {
            const response = await fetch(`${EP_user_management}/${userId}`, {
                method: "DELETE",
                headers: appendAuthHeader(),
            });
            if (!response.ok) throw new Error("Failed to delete user");
            setUsers(users.filter((user) => user.id !== userId));
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    }

    */

    // Rolle zuweisen
    /*async function updateRole(userId: number) {
        const role = selectedRole[userId] === "Admin";
        try {
            const response = await fetch(`${EP_user_management}/${userId}/role`, {
                method: "PUT",
                headers: appendAuthHeader(),
                body: JSON.stringify({ isAdmin: role }),
            });
            if (!response.ok) throw new Error("Failed to update role");
            fetchUsers();
        } catch (error) {
            console.error("Error updating role:", error);
        }
    }*/

    // Benutzer zu Abteilung hinzufügen
    /*async function addUserToDepartment(userId: number) {
        const departmentId = selectedDepartment[userId];
        if (!departmentId) return;

        try {
            const response = await fetch(`${EP_user_management}/${userId}/department`, {
                method: "POST",
                headers: appendAuthHeader(),
                body: JSON.stringify({ department_id: departmentId }),
            });
            if (!response.ok) throw new Error("Failed to assign department");
            fetchUsers();
        } catch (error) {
            console.error("Error assigning department:", error);
        }
    }*/

    // Benutzer von Abteilung entfernen
    /*async function removeUserFromDepartment(userId: number) {
        try {
            const response = await fetch(`${EP_user_management}/${userId}/department`, {
                method: "DELETE",
                headers: appendAuthHeader(),
            });
            if (!response.ok) throw new Error("Failed to remove from department");
            fetchUsers();
        } catch (error) {
            console.error("Error removing from department:", error);
        }
    }*/

    return (
        <div className="p-5 flex flex-col items-center">
            <h1 className="text-center text-white mb-7 font-mono">Admin Dashboard</h1>
            {/* Department Dropdown */}
                <Label className="text-white mb-2">Please select a Department to display their users.</Label>
                <select
                    value={selectedDepartment?.department_name || ""}
                    onChange={(e) => handleDepartmentChange(e)}
                    className="border border-black p-2 rounded-md w-[500px]"
                >
                    <option value="" disabled>Select a department</option>
                    {departments.map((dept) => (
                        <option key={dept.department_id} value={dept.department_name}>
                            {dept.department_name}
                        </option>
                    ))}
                </select>
        </div>
    );
}
