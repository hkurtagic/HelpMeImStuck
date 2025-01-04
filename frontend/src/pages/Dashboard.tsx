import Sidebar from "@/components/Sidebar.tsx";

export default function Dashboard() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-screen overflow-hidden bg-gradient-to-bl from-blue-500 to-orange-800 relative">
            <Sidebar/>
        </div>
    );
}