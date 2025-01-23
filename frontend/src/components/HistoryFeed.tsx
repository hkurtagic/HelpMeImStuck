import React, { useEffect, useState } from "react";
import { FlagTriangleRight } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";
import HistoryEventCreate from "@/components/HistoryEventCreate.tsx";
import HistoryEventStatusChange from "@/components/HistoryEventStatusChange.tsx";
import {
    EventType,
    TicketHistory,
    TicketHistoryEvent,
    TicketStatus,
} from "@shared/shared_types.ts";
import HistoryEventAddComment from "@/components/HistoryEventAddComment.tsx";

interface HistoryEntry {
    author: string;
    title: string;
    description: string;
    comments: string;
    timestamp: string;
    image?: string;
}

interface HistoryFeedProps {
    tickethistory: TicketHistory;
}

export default function HistoryFeed({ tickethistory }: HistoryFeedProps) {
    const [inputText, setInputText] = useState("");
    useEffect(() => {
    }, []);

    return (
        <>
            <div className={"relative border-s border-gray-200 dark:border-gray-700 w-full"}>
                {tickethistory.ticket
                    ? (
                        <HistoryEventCreate
                            user_name={tickethistory.ticket.author.user_name}
                            opened={tickethistory.ticket.created_at.toString()}
                            ticket_title={tickethistory.ticket.ticket_title}
                            ticket_description={tickethistory.ticket.ticket_description}
                            departments={tickethistory.ticket.departments}
                            status={tickethistory.ticket.ticket_status}
                            // tags={tickethistory.ticket.tags}
                        />
                    )
                    : <></>}
                {tickethistory.events
                    ? (tickethistory.events.map((e) => {
                        switch (e.event_type) {
                            case EventType.statusChange:
                                return (
                                    <HistoryEventStatusChange
                                        user_name={e.author.user_name}
                                        status={e.new_status}
                                        on={e.created_at?.toString() ?? ""}
                                    />
                                );

                                break;
                            case EventType.comment:
                                return (
                                    <HistoryEventAddComment
                                        user_name={e.author.user_name}
                                        comment={e.comment}
                                        on={e.created_at?.toString() ?? ""}
                                    />
                                );
                                break;
                        }
                    }))
                    : <></>}
            </div>
            {/* Textfeld für Benutzereingaben */}
            <div className="mt-10 flex flex-wrap flex-row">
                <h3>Add a new command</h3>
                <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Schreibe hier etwas hinein..."
                    className="w-full border p-2 rounded mt-3"
                />
                <Button
                    className="mt-4 ml-4 bg-green-500 hover:bg-green-600 text-white px-4 py-2"
                    onClick={() => console.log("Eingabe:", inputText)}
                >
                    Absenden
                </Button>
            </div>
        </>
    );
}
