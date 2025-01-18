
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import TicketCard from "@/components/Ticket.tsx";
import {appendAuthHeader, EP_ticket} from "@/route_helper/routes_helper.tsx";
import { Department, Ticket, TicketStatus } from "@shared/shared_types";
import user from "../../../backend/route/User.ts";

interface TicketOverviewProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setView: React.Dispatch<React.SetStateAction<any>>;
    selectedDepartment: Department | null;
}

export default function SupporterTicketOverview(
    { setView, selectedDepartment }: TicketOverviewProps,
) {
    const [tickets, setTickets] = useState<Ticket[]>([]);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch(EP_ticket, {
                    method: "GET",
                    headers: appendAuthHeader({
                        "Content-Type": "application/json",
                    }),
                });

                if (!response.ok) throw new Error("Failed to fetch tickets");

                const data = await response.json(); // Erwartet eine Liste von Tickets
                setTickets(data);
            } catch (error) {
                console.error("Error fetching tickets:", error);
            }
        };
        console.log("TicketHook: " + JSON.stringify(selectedDepartment));

        if (selectedDepartment) {
            console.log(selectedDepartment);
            fetchTickets();
        }
    }, [selectedDepartment]); // Lädt Tickets neu, wenn sich die Abteilung ändert    //TODO selectedDepartments entfernen !!

    // Funktion zum Aktualisieren des Ticket-Status
    const updateTicketStatus = (ticketId: string, newStatus: number) => {
        setTickets((prevTickets) =>
            prevTickets.map((ticket) =>
                ticket.ticket_id === ticketId ? { ...ticket, status: newStatus } : ticket
            )
        );
    };


    // Tickets nach Status filtern
    const openTickets = tickets.filter((ticket) => ticket.status === TicketStatus.OPEN);
    const inProgressTickets = tickets.filter((ticket) =>
        ticket.status === TicketStatus.IN_PROGRESS
    );
    const closedTickets = tickets.filter((ticket) => ticket.status === TicketStatus.CLOSED);

    return (
        <div className="space-y-10">
            <div className="flex row-auto justify-end mx-5">
                <Button
                    className="bg-green-500 md:w-1/12 font-bold hover:bg-green-600"
                    onClick={() => setView("create")}
                >
                    New Ticket
                </Button>
            </div>

            <h1 className="text-center text-white mb-7 font-mono">Supporter Tickets</h1>
            <h2 className="text-center text-white mb-4 font font-mono">Select a department to view incoming tickets!</h2>

            {/* Open Tickets */}
            <Card>
                <CardHeader>
                    <CardTitle>Open Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {openTickets.length > 0
                        ? (
                            openTickets.map((ticket) => (
                                <TicketCard
                                    key={ticket.ticket_id}
                                    ticket={ticket}
                                    showButton={true}
                                    showHistoryIcon={true}
                                    role={"supporter"}
                                    setView={setView}
                                    updateTicketStatus={updateTicketStatus}/>
                            ))
                        )
                        : <p>At the moment you have no open tickets.</p>}
                </CardContent>
            </Card>

            {/* In Progress Tickets */}
            <Card>
                <CardHeader>
                    <CardTitle>Tickets in Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {inProgressTickets.length > 0
                        ? (
                            inProgressTickets.map((ticket) => (
                                <TicketCard
                                    key={ticket.ticket_id}
                                    ticket={ticket}
                                    showButton={true}
                                    showHistoryIcon={true}
                                    role={"supporter"}
                                    setView={setView}
                                    updateTicketStatus={updateTicketStatus}
                                />
                            ))
                        )
                        : <p>There are no tickets in progress.</p>}
                </CardContent>
            </Card>

            {/* Closed Tickets */}
            <Card>
                <CardHeader>
                    <CardTitle>Closed Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {closedTickets.length > 0
                        ? (
                            closedTickets.map((ticket) => (
                                <TicketCard
                                    key={ticket.ticket_id}
                                    ticket={ticket}
                                    showButton={true}
                                    showHistoryIcon={true}
                                    role={"supporter"}
                                    setView={setView}
                                    updateTicketStatus={updateTicketStatus}
                                />
                            ))
                        )
                        : <p>There are no closed tickets.</p>}
                </CardContent>
            </Card>
        </div>
    );
}
