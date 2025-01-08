import React, { useState } from 'react';
import RequesterSidebarItem from './RequesterSidebarItem.tsx';
import { PanelLeftClose, PanelRightClose, Ticket, ChartArea, LogOut } from 'lucide-react';
import RequesterTicketOverview from '@/components/RequesterTicketOverview.tsx';
import { useNavigate } from 'react-router-dom';
import CreateTicketForm from "@/components/CreateTicketForm.tsx";

export default function RequesterDashboard() {

    const [view, setView] = useState<'overview' | 'create'>('overview');


    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    // Sidebar-Toggle-Funktion
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    // Logout-Funktion
    const handleLogout = async () => {
        try {
            console.log('Logging out...');

            const response = await fetch(import.meta.env.VITE_BACKEND_API + '/logout', {
                method: 'POST',
                /*headers: {
                    //'Authorization': `Bearer ${localStorage.getItem()}`
                },*/
            });

            if (!response.ok) {
                throw new Error('Failed to logout from server');
            }

            //localStorage.removeItem('token');
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

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

                {/* Sidebar-Elemente */}
                <div className="m-4">
                    <RequesterSidebarItem icon={Ticket} label="Tickets" isOpen={isOpen} />
                    <RequesterSidebarItem icon={ChartArea} label="Statistics" isOpen={isOpen} />
                    <RequesterSidebarItem icon={LogOut} label="Log Out" isOpen={isOpen} onClick={handleLogout} />
                </div>
            </div>

            {/* Dashboard Content */}
            <div className={`flex-1 overflow-auto p-5 transition-all duration-300 ${isOpen ? 'md:ml-64' : 'md:ml-16'}`}>
                {view === 'overview' && <RequesterTicketOverview setView={setView} />}
                {view === 'create' && <CreateTicketForm setView={setView} />}
            </div>
        </div>
    );
}
