import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import Ticket from "@/components/Ticket.tsx";
import { EP_ticket } from "@/route_helper/routes_helper.tsx";

export default function RequesterTicketOverview({ setView, selectedDepartment }) {
    const [tickets, setTickets] = useState([]);

    /**
     * Bisherige implementation erwartet alle tickets und filtert nach dropdown selection
     * evtl. zuerst dropdown selection und dann request inkl. selection im body
     */
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const response = await fetch(EP_ticket, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        department_name: selectedDepartment || null, // Schicke den Namen oder null
                    }),
                });

                if (!response.ok) throw new Error('Failed to fetch tickets');

                const data = await response.json(); // Erwartet eine Liste von Tickets
                setTickets(data);
            } catch (error) {
                console.error('Error fetching tickets:', error);
            }
        };

        fetchTickets();
    }, []); // Lädt Tickets neu, wenn sich die Abteilung ändert

    // Tickets nach Status filtern
    const openTickets = tickets.filter(ticket => ticket.status_name === 'open');
    const inProgressTickets = tickets.filter(ticket => ticket.status_name === 'in_progress');
    const closedTickets = tickets.filter(ticket => ticket.status_name === 'closed');

    return (
        <div className="space-y-10">
            <div className="flex row-auto justify-end mx-5">
                <Button
                    className="bg-green-500 md:w-1/12 font-bold hover:bg-green-600"
                    onClick={() => setView('create')}
                >
                    New Ticket
                </Button>
            </div>

            <h1 className="text-center text-white mb-7 font-mono">Tickets</h1>

            {/* Open Tickets */}
            <Card>
                <CardHeader>
                    <CardTitle>Open Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {openTickets.length > 0 ? (
                        openTickets.map(ticket => (
                            <Ticket key={ticket.id} ticket={ticket} showButton={true} />
                        ))
                    ) : (
                        <p>At the moment you have no open tickets.</p>
                    )}
                </CardContent>
            </Card>

            {/* In Progress Tickets */}
            <Card>
                <CardHeader>
                    <CardTitle>Tickets in Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {inProgressTickets.length > 0 ? (
                        inProgressTickets.map(ticket => (
                            <Ticket key={ticket.id} ticket={ticket} showButton={false} />
                        ))
                    ) : (
                        <p>There are no tickets in progress.</p>
                    )}
                </CardContent>
            </Card>

            {/* Closed Tickets */}
            <Card>
                <CardHeader>
                    <CardTitle>Closed Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {closedTickets.length > 0 ? (
                        closedTickets.map(ticket => (
                            <Ticket key={ticket.id} ticket={ticket} showButton={false} />
                        ))
                    ) : (
                        <p>There are no closed tickets.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
