import React, { useState } from 'react';
import SidebarItem from './SidebarItem';
import { PanelLeftClose, PanelRightClose, Ticket, ChartArea, LogOut } from 'lucide-react';

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    // Toggle Sidebar
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Mobile Button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-5 left-5 z-50 p-2 bg-transparent focus:outline-none"
            >
                {isOpen ? (
                    <PanelRightClose size={32} className="text-black" />
                ) : (
                    <PanelLeftClose size={32} className="text-white" />
                )}
            </button>

            {/* Mobile Sidebar */}
            {isOpen && (
                <div className="md:hidden fixed w-3/4 left-0 top-0 h-screen bg-slate-100 text-black z-40 overflow-auto rounded-r-3xl">
                    <div className="mt-16 p-4">
                        <SidebarItem icon={Ticket} label="Home" isOpen={true} />
                        <SidebarItem icon={ChartArea} label="Statistics" isOpen={true} />
                        <SidebarItem icon={LogOut} label="Log Out" isOpen={true} />
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <div
                className={`
                    hidden md:flex flex-col bg-slate-100 text-white h-screen
                    transition-all duration-300 fixed top-0 left-0 z-30
                    ${isOpen ? 'w-64 rounded-r-3xl' : 'w-16 rounded-r-3xl'}
                `}
            >
                {/* Toggle-Button */}
                <button
                    onClick={toggleSidebar}
                    className={isOpen
                        ? "group flex m-8 p-0 w-max bg-slate-100 focus:outline-none"
                        : "group flex justify-center p-0 mt-8 bg-slate-100 focus:outline-none"}
                >
                    {isOpen ? (
                        <PanelLeftClose size={32} className="text-black group-hover:text-fuchsia-900" />
                    ) : (
                        <PanelRightClose size={32} className="text-black group-hover:text-fuchsia-900" />
                    )}
                </button>

                {/* Menüelemente */}
                <div className="m-4">
                    <SidebarItem icon={Ticket} label="Tickets" isOpen={isOpen} />
                    <SidebarItem icon={ChartArea} label="Statistics" isOpen={isOpen} />
                    <SidebarItem icon={LogOut} label="Log Out" isOpen={isOpen} />
                </div>
            </div>

            {/* Inhalt */}
            <div
                className={`
                    flex-1 transition-all duration-300 p-4
                    ${isOpen ? 'md:ml-64' : 'md:ml-16'}
                `}
            >
                <h1 className="text-2xl font-bold">Hauptinhalt</h1>
                <p>Hier ist der Hauptinhalt der Seite.</p>
            </div>
        </>
    );
}
