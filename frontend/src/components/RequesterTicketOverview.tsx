import React, { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import TicketCard from "@/components/Ticket.tsx";
import { appendAuthHeader, EP_ticket, EP_ticket_event } from "@/route_helper/routes_helper.tsx";
import {
    Department,
    EventType,
    Ticket,
    TicketEvent_StatusChange,
    TicketStatus,
    UUID,
} from "@shared/shared_types";
import { UserContext } from "./UserContext";

interface TicketOverviewProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setView: React.Dispatch<React.SetStateAction<any>>;
    selectedDepartment: Department | null;
    setTicketID: React.Dispatch<React.SetStateAction<UUID>>;
}

export default function RequesterTicketOverview(
    { setView, selectedDepartment, setTicketID }: TicketOverviewProps,
) {
    const [reloadTickets, setReloadTickets] = useState<boolean>(true);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [openTickets, setOpenTickets] = useState<Ticket[]>([]);
    const [inProgressTickets, setInProgressTickets] = useState<Ticket[]>([]);
    const [closedTickets, setClosedTickets] = useState<Ticket[]>([]);
    const { user } = useContext(UserContext);

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

                const data = await response.json() as Ticket[]; // Erwartet eine Liste von Tickets
                if (data.length) {
                    setTickets(data);
                    setOpenTickets(
                        data.filter((ticket) => ticket.ticket_status === TicketStatus.OPEN),
                    );
                    setInProgressTickets(
                        data.filter((ticket) => ticket.ticket_status === TicketStatus.IN_PROGRESS),
                    );
                    setClosedTickets(
                        data.filter((ticket) => ticket.ticket_status === TicketStatus.CLOSED),
                    );
                }
            } catch (error) {
                console.error("Error fetching tickets:", error);
            }
        };
        console.log("TicketHook: " + JSON.stringify(selectedDepartment));

        if (selectedDepartment && reloadTickets) {
            console.log(selectedDepartment);
            fetchTickets();
            setReloadTickets(false);
        }
    }, [selectedDepartment, reloadTickets]); // Lädt Tickets neu, wenn sich die Abteilung ändert

    const addTicketEvent = async (ticket_id: UUID, new_status: TicketStatus): Promise<boolean> => {
        const new_event: TicketEvent_StatusChange = {
            new_status: new_status,
            author: { user_id: user.user_id, user_name: user.user_name },
            ticket_id: ticket_id,
            event_type: EventType.statusChange,
            description: selectedDepartment?.department_id.toString(),
        };
        return await fetch(EP_ticket_event(ticket_id), {
            method: "PUT",
            headers: appendAuthHeader({
                "Content-Type": "application/json",
            }),
            body: JSON.stringify(new_event),
        }).then((res) => {
            if (!res.ok) return false;
            return true;
        }).catch((error) => {
            console.error("Error fetching tickets:", error);
            return false;
        });
    };

    // Funktion zum Aktualisieren des Ticket-Status
    const updateTicketStatus = async (ticketId: string, newStatus: number) => {
        const is_ticket_updated = await addTicketEvent(ticketId, newStatus);
        if (is_ticket_updated) {
            setTickets((prevTickets) =>
                prevTickets.map((ticket) =>
                    ticket.ticket_id === ticketId ? { ...ticket, status: newStatus } : ticket
                )
            );
            setOpenTickets(tickets.filter((ticket) => ticket.ticket_status === TicketStatus.OPEN));
            setInProgressTickets(
                tickets.filter((ticket) => ticket.ticket_status === TicketStatus.IN_PROGRESS),
            );
            setClosedTickets(
                tickets.filter((ticket) => ticket.ticket_status === TicketStatus.CLOSED),
            );
        }
        setReloadTickets(true);
    };

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

            <h1 className="text-center text-white mb-7 font-mono">Tickets</h1>
            <h2 className="text-center text-white mb-4 font font-mono">
                Select a department to view your tickets!
            </h2>

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
                                    showHistoryIcon={true}
                                    setView={setView}
                                    updateTicketStatus={updateTicketStatus}
                                    role={"requester"}
                                    setTicketID={setTicketID}
                                />
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
                                    showHistoryIcon={true}
                                    setView={setView}
                                    updateTicketStatus={updateTicketStatus}
                                    role={"requester"}
                                    setTicketID={setTicketID}
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
                                    showHistoryIcon={true}
                                    setView={setView}
                                    updateTicketStatus={updateTicketStatus}
                                    role={"requester"}
                                    setTicketID={setTicketID}
                                />
                            ))
                        )
                        : <p>There are no closed tickets.</p>}
                </CardContent>
            </Card>
        </div>
    );
}
