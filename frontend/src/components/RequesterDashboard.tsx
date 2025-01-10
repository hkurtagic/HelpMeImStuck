import React, { useState, useEffect } from 'react';
import RequesterSidebarItem from './RequesterSidebarItem.tsx';
import { PanelLeftClose, PanelRightClose, Ticket, ChartArea, LogOut } from 'lucide-react';
import RequesterTicketOverview from '@/components/RequesterTicketOverview.tsx';
import { useNavigate } from 'react-router-dom';
import CreateTicketForm from "@/components/CreateTicketForm.tsx";
import {EP_department, EP_logout} from "@/route_helper/routes_helper.tsx";
import StatisticsPage from "@/pages/StatisticsPage.tsx";
import {Department} from "@shared/shared_types.ts";

export default function RequesterDashboard() {
    const [view, setView] = useState<'overview' | 'create'>('overview');
    const [isOpen, setIsOpen] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const navigate = useNavigate();

    // Sidebar-Toggle
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    // logout functionality
    const handleLogout = async () => {
        try {
            console.log('Logging out...');

            const response = await fetch(EP_logout, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to logout from server');
            }

            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // get departments from backend
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await fetch(EP_department);
                if (!response.ok) throw new Error('Failed to fetch departments');
                const data = await response.json();
                setDepartments(data);
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        };

        fetchDepartments();
    }, []);

    return (
        <div className="flex w-screen h-screen overflow-hidden">
            {/* Mobile Sidebar Toggle Button */}
            <button
                onClick={toggleSidebar}
                className={`md:hidden fixed top-5 left-5 z-50 p-2 ${
                    isOpen ? 'text-black bg-white' : 'bg-fuchsia-500 text-white'
                } focus:outline-none`}
            >
                {isOpen ? (
                    <PanelRightClose size={30} className="text-black" />
                ) : (
                    <PanelLeftClose size={30} className="text-white" />
                )}
            </button>

            {/* Mobile Sidebar */}
            {isOpen && (
                <div className="md:hidden fixed w-3/4 left-0 top-0 h-screen bg-white text-black z-40 overflow-auto rounded-r-3xl">
                    <div className="mt-16 p-4">
                        <RequesterSidebarItem icon={Ticket} label="Home" isOpen={true} />
                        <RequesterSidebarItem icon={ChartArea} label="Statistics" isOpen={true} />
                        <RequesterSidebarItem icon={LogOut} label="Log Out" isOpen={true} onClick={handleLogout} />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div
                className={`
                    hidden md:flex flex-col bg-white text-white h-screen
                    transition-all duration-300 fixed top-0 left-0 z-30
                    ${isOpen ? 'w-64 rounded-r-3xl' : 'w-16 rounded-r-3xl'}
                `}
            >
                {/* Sidebar Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className={
                        isOpen
                            ? 'group flex m-8 p-0 w-max bg-white focus:outline-none'
                            : 'group mx-auto p-0 w-max mt-8 bg-white focus:outline-none'
                    }
                >
                    {isOpen ? (
                        <PanelLeftClose size={30} className="text-black group-hover:text-fuchsia-900" />
                    ) : (
                        <PanelRightClose size={30} className="text-black group-hover:text-fuchsia-900" />
                    )}
                </button>

                {/* Dropdown für Departments */}
                {isOpen && (
                    <div className="p-4">
                        <label htmlFor="department-select" className="block text-black font-medium mb-2">
                            Select Department:
                        </label>
                        <select
                            id="department-select"
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full p-2 border rounded-md text-black"
                        >
                            <option value="" disabled>
                                Choose a department
                            </option>
                            {departments.map((dept) => (
                                <option value={dept.pk_department_id}>
                                    {dept.department_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Sidebar Elements */}
                <div className="m-4">
                    <RequesterSidebarItem icon={Ticket} label="Tickets" isOpen={isOpen} onClick={() => setView ('tickets')}/>
                    <RequesterSidebarItem icon={ChartArea} label="Statistics" isOpen={isOpen} onClick={() => setView('statistics')}/>
                    <RequesterSidebarItem icon={LogOut} label="Log Out" isOpen={isOpen} onClick={handleLogout} />
                </div>
            </div>

            {/* Dashboard Content */}
            <div className={`flex-1 overflow-auto p-5 transition-all duration-300 ${isOpen ? 'md:ml-64' : 'md:ml-16'}`}>
                {view === 'overview' && <RequesterTicketOverview setView={setView} />}
                {view === 'create' && <CreateTicketForm setView={setView} />}
                {view === 'statistics' && <StatisticsPage/>}
                {view === 'tickets' && <RequesterTicketOverview setView={setView} selectedDepartment={selectedDepartment}/>}
            </div>
        </div>
    );
}
