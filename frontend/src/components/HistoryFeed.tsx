import React, { useState } from "react";
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
import { TicketStatus } from "@shared/shared_types.ts";
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
    history: HistoryEntry[];
}

export default function HistoryFeed({ history = [] }: HistoryFeedProps) {
    const [inputText, setInputText] = useState("");
    return (
        <>
            <div className={"relative border-s border-gray-200 dark:border-gray-700 w-full"}>
                <HistoryEventCreate
                    user_name={"testUser"}
                    opened={"2025-01-23 04:06:55.030 +00:00"}
                    ticket_title={"Ticket Title"}
                    ticket_description={"Some asdkjfhalisudzfiluasdhfliuasdliufhalskduflkausdhf"}
                />
                <HistoryEventStatusChange
                    user_name={"testSupporter"}
                    status={TicketStatus.IN_PROGRESS}
                    on={"2025-01-23 04:06:55.030 +00:00"}
                />
                <HistoryEventAddComment
                    user_name={"testSupporter"}
                    comment={"asdffdasdfasdfasdef"}
                    on={"2025-01-23 04:06:55.030 +00:00"}
                />
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
