import { useEffect, useState } from "react";
import HistoryFeed from "@/components/HistoryFeed.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import { TicketHistory, UUID } from "@shared/shared_types";
import { appendAuthHeader, EP_ticket_event } from "@/route_helper/routes_helper";

interface HistoryProps {
    ticket_id: UUID;
}

export default function HistoryPage({ ticket_id }: HistoryProps) {
    const [inputText, setInputText] = useState("");

    return (
        <div className="p-4">
            {history ? <HistoryFeed tickethistory={history} /> : <></>}

            {/* Textfeld für Benutzereingaben */}
            <div className="mt-10 flex flex-row">
                <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Schreibe hier etwas hinein..."
                    className="w-full border p-2 rounded"
                />
                <Button
                    className="mt-4 ml-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2"
                    onClick={() => console.log("Eingabe:", inputText)}
                >
                    Absenden
                </Button>
            </div>
        </div>
    );
}
