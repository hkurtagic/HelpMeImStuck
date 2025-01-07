import React, { useState } from 'react';
import RequesterSidebarItem from './RequesterSidebarItem.tsx';
import { PanelLeftClose, PanelRightClose, Ticket, ChartArea, LogOut } from 'lucide-react';
import RequesterTicketOverview from "@/components/RequesterTicketOverview.tsx";

export default function RequesterDashboard() {
    const [isOpen, setIsOpen] = useState(false);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="flex w-screen h-screen overflow-hidden">
            {/************* SIDEBAR *************/}

            {/* Mobile Button */}
            <button
                onClick={toggleSidebar}
                className={`md:hidden fixed top-5 left-5 z-50 p-2 ${isOpen ? "text-black bg-white" : "bg-fuchsia-500 text-white"} focus:outline-none`}
            >
                {isOpen ? (
                    <PanelRightClose size={30} className="text-black" />
                ) : (
                    <PanelLeftClose size={30} className="text-white" />
                )}


            </button>

            {/* Mobile RequesterDashboard */}
            {isOpen && (
                <div className="md:hidden fixed w-3/4 left-0 top-0 h-screen bg-white text-black z-40 overflow-auto rounded-r-3xl">
                    <div className="mt-16 p-4">
                        <RequesterSidebarItem icon={Ticket} label="Home" isOpen={true} />
                        <RequesterSidebarItem icon={ChartArea} label="Statistics" isOpen={true} />
                        <RequesterSidebarItem icon={LogOut} label="Log Out" isOpen={true} />
                    </div>
                </div>
            )}

            {/* Desktop RequesterDashboard */}
            <div
                className={`
                    hidden md:flex flex-col bg-white text-white h-screen
                    transition-all duration-300 fixed top-0 left-0 z-30
                    ${isOpen ? 'w-64 rounded-r-3xl' : 'w-16 rounded-r-3xl'}
                `}
            >
                {/* Toggle button */}
                <button
                    onClick={toggleSidebar}
                    className={isOpen
                        ? "group flex m-8 p-0 w-max bg-white focus:outline-none"
                        : "group mx-auto p-0 w-max mt-8 bg-white focus:outline-none"}
                >
                    {isOpen ? (
                        <PanelLeftClose size={30} className="text-black group-hover:text-fuchsia-900" />
                    ) : (
                        <PanelRightClose size={30} className="text-black group-hover:text-fuchsia-900" />
                    )}
                </button>

                {/* Menu elements */}
                <div className="m-4">
                    <RequesterSidebarItem icon={Ticket} label="Tickets" isOpen={isOpen} />
                    <RequesterSidebarItem icon={ChartArea} label="Statistics" isOpen={isOpen} />
                    <RequesterSidebarItem icon={LogOut} label="Log Out" isOpen={isOpen} />
                </div>
            </div>

            {/************* Dashboard Content *************/}

            <div className={`flex-1 overflow-auto p-5 transition-all duration-300 ${isOpen ? 'md:ml-64' : 'md:ml-16'}`}>
                <h1 className="text-center text-white mb-7 font-mono">Tickets</h1>
                <RequesterTicketOverview />
            </div>
        </div>
    );
}
