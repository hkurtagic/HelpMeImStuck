import RequesterDashboard from "@/components/RequesterDashboard.tsx";
import SupporterDashboard from "@/components/SupporterDashboard.tsx";
import HistoryPage from "@/pages/HistoryPage.tsx";

export default function DashboardPage() {
    return (
        <div className="w-screen min-h-screen overflow-auto bg-gradient-to-bl from-fuchsia-800 to-blue-700 bg-fixed">
            {/* RequesterDashboard mit Hauptinhalt */}
            <RequesterDashboard />
        </div>
    );
}
