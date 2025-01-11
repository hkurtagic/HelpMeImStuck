import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Ticket } from "@shared/shared_types";

export default function TicketCard(
	{ ticket, showButton }: { ticket: Ticket; showButton: boolean },
) {
	return (
		<>
			<Card className="bg-blue-100">
				<CardHeader>
					<CardTitle>Speaker doesn't work</CardTitle>
				</CardHeader>
				<CardContent className="flex">
					<p>Left Speaker in A.1.02 has no sound!</p>
					<button className="ml-auto bg-amber-500 hover:bg-amber-600">
					</button>
				</CardContent>
			</Card>
		</>
	);
}
