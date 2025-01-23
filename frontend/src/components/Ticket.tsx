import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Ticket, TicketStatus } from "@shared/shared_types";
import { Button } from "@/components/ui/button.tsx";
import { GitCommitVertical } from "lucide-react";

interface TicketCardProps {
    ticket: Ticket;
    showHistoryIcon: boolean;
    setView: React.Dispatch<React.SetStateAction<any>>;
    updateTicketStatus: (ticketId: string, newStatus: number) => void;
    role: string;
}

export default function TicketCard({
    ticket,
    showHistoryIcon,
    setView,
    updateTicketStatus,
    role,
}: TicketCardProps) {
    return (
        <Card className="bg-blue-100">
            <CardHeader>
                <CardTitle>{ticket.ticket_title}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-between items-center">
                {/* Ticket description */}
                <p>{ticket.ticket_description}</p>

                <div className="flex items-center space-x-4">
                    {ticket.ticket_status === TicketStatus.OPEN && role === "requester" && (
                        <Button
                            className="bg-amber-500 hover:bg-amber-600"
                            onClick={() =>
                                updateTicketStatus(ticket.ticket_id, TicketStatus.CLOSED)}
                        >
                            Pull back
                        </Button>
                    )}

                    {ticket.ticket_status === TicketStatus.OPEN && role === "supporter" && (
                        <Button
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() =>
                                updateTicketStatus(ticket.ticket_id, TicketStatus.IN_PROGRESS)}
                        >
                            Accept
                        </Button>
                    )}

                    {ticket.ticket_status === TicketStatus.OPEN && role === "supporter" && (
                        <Button
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() =>
                                updateTicketStatus(ticket.ticket_id, TicketStatus.CLOSED)}
                        >
                            Decline
                        </Button>
                    )}

                    {ticket.ticket_status === TicketStatus.IN_PROGRESS && role === "supporter" && (
                        <Button
                            className="bg-amber-500 hover:bg-amber-600"
                            onClick={() => updateTicketStatus(ticket.ticket_id, TicketStatus.OPEN)}
                        >
                            Back to Queue
                        </Button>
                    )}

                    {ticket.ticket_status === TicketStatus.IN_PROGRESS && role === "supporter" && (
                        <Button
                            className="bg-amber-500 hover:bg-amber-600"
                            onClick={() =>
                                updateTicketStatus(ticket.ticket_id, TicketStatus.CLOSED)}
                        >
                            Close
                        </Button>
                    )}

                    {/* Icon immer anzeigen */}
                    {showHistoryIcon && (
                        <GitCommitVertical
                            className="text-gray-700 h-8 w-8 hover:text-fuchsia-600 cursor-pointer"
                            onClick={() => {
                                console.log("Icon clicked for ticket:", ticket.ticket_id);
                                setView("history");
                            }}
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
