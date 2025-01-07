import React from 'react';
import { LucideIcon } from 'lucide-react';

type SidebarItemProps = {
    icon: LucideIcon; // Spezifischer Typ für Lucide-Icons
    label: string;
    isOpen: boolean;
};

// Menüelement der RequesterDashboard
export default function RequesterSidebarItem({ icon: Icon, label, isOpen }: SidebarItemProps) {
    return (
        <div
            className={`flex items-center p-4 text-black hover:text-fuchsia-900 rounded-xl cursor-pointer 
            ${isOpen ? 'justify-start hover:bg-gray-200' : 'justify-center'}
        `}
        >
            {/* Icon Wrapper */}
            <div className="flex items-center justify-center">
                <Icon size={30} />
            </div>

            {/* Label wird nur angezeigt, wenn die RequesterDashboard offen ist */}
            {isOpen && <span className="ml-4 text-lg font-medium">{label}</span>}
        </div>
    );
}
