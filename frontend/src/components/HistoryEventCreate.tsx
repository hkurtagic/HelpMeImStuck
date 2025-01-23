import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Department, TicketStatus } from "@shared/shared_types";
import React from "react";

interface HistoryEventCreateProps {
    user_name: string;
    opened: string;
    ticket_title: string;
    ticket_description: string;
    departments: Department[];
    status: TicketStatus;
}

export default function HistoryEventCreate({
    user_name,
    opened,
    ticket_title,
    ticket_description,
    departments,
    status,
}: HistoryEventCreateProps) {
    return (
        <Card className={"ml-3 w-fit mb-0"}>
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-[5em] -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700">
            </div>
            <CardHeader
                className={"p-3 border-b-2 border-gray-200 flex flex-wrap flex-row items-baseline gap-2 justify-center"}
            >
                <span>{user_name}</span>
                <span className={"text-gray-400"}>
                    opend at {Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    }).format(Date.parse(opened))}
                </span>
                <span className={"border-s rounded-full bg-gray-400 px-2"}>
                    {TicketStatus[status]}
                </span>
                <span className={"text-gray-400"}>
                    assigned department {departments[0].department_name}
                </span>
            </CardHeader>
            <CardTitle className={"pt-3 pl-3"}>
                <h2>{ticket_title}</h2>
            </CardTitle>
            <CardContent className={"pt-3"}>
                {ticket_description}
            </CardContent>
        </Card>
    );
}
