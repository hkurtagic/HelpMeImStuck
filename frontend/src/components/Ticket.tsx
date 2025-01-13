import { React, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import {Department, Ticket} from "@shared/shared_types";
import { Button } from "@/components/ui/button.tsx";
import { GitCommitVertical } from "lucide-react";


interface TicketCardProps {
	ticket: Ticket;
	showButton: boolean;
	showHistoryIcon: boolean;
	setView: React.Dispatch<React.SetStateAction<any>>;
	updateTicketStatus: (ticketId: string, newStatus: number) => void;
}

export default function TicketCard({
									   ticket,
									   showButton,
									   showHistoryIcon,
									   setView,
									   updateTicketStatus,
								   }: TicketCardProps) {
	return (
		<Card className="bg-blue-100">
			<CardHeader>
				<CardTitle>{ticket.title}</CardTitle>
			</CardHeader>
			<CardContent className="flex justify-between items-center">
				{/* Beschreibung des Tickets */}
				<p>{ticket.description}</p>

				{/* Icon und Button rechts ausgerichtet */}
				<div className="flex items-center space-x-4">
					{/* Button */}
					{ticket.status === 0 && showButton && (
						<Button
							className="bg-amber-500 hover:bg-amber-600"
							onClick={() => updateTicketStatus(ticket.ticket_id, 2)}
						>
							Pull back
						</Button>
					)}

					{/* Icon */}
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
