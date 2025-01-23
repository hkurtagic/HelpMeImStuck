import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import HistoryFeed from "./HistoryFeed";
import { appendAuthHeader, EP_ticket_event } from "@/route_helper/routes_helper";
import { UUID } from "crypto";
import { useEffect, useState } from "react";
import { TicketHistory as T_TicketHistory, TicketHistoryEvent } from "@shared/shared_types";

interface TicketHistoryProps {
    setView: React.Dispatch<React.SetStateAction<"overview" | "create" | "history">>;
    ticket_id: UUID;
}

export default function TicketHistory({ setView, ticket_id }: TicketHistoryProps) {
    const [history, setHistory] = useState<T_TicketHistory | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchHistory = async (ticket_id: UUID) => {
        try {
            const response = await fetch(EP_ticket_event(ticket_id), {
                method: "GET",
                headers: appendAuthHeader({
                    "Content-Type": "application/json",
                }),
            });
            if (!response.ok) throw new Error("Failed to fetch tickets");

            const data = await response.json() as T_TicketHistory; // Erwartet eine Liste von Tickets
            // if (data.events.length) {
            setHistory(data);

            // }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        }
    };
    useEffect(() => {
        if (ticket_id && loading) {
            fetchHistory(ticket_id);

            setLoading(false);
        }
    }, []);

    return (
        <div className="items-center justify-center min-h-screen">
            <Card className="w-full h-screen q-2/3 shadow-lg">
                <CardHeader>
                    <Button
                        className="bg-red-500 hover:bg-red-600 w-1/12 "
                        onClick={() => setView("overview")}
                    >
                        Back
                    </Button>
                    <CardTitle className="text-2xl text-center">Ticket History</CardTitle>
                </CardHeader>

                <CardContent>
                    {history ? <HistoryFeed tickethistory={history} /> : <></>}
                </CardContent>
            </Card>
        </div>
    );
}
