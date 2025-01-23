import { Card, CardContent } from "@/components/ui/card.tsx";
import React from "react";
import { TicketStatus } from "@shared/shared_types.ts";

interface Props {
    user_name: string;
    status: TicketStatus;
    on: string;
}

export default function HistoryEventStatusChange({ user_name, status, on }: Props) {
    return (
        <Card className={"border-0 shadow-none mt-10 mb-0 w-fit"}>
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700">
            </div>
            <CardContent
                className={"flex flex-wrap flex-row items-baseline gap-2 justify-center"}
            >
                <span>{user_name}</span>
                <span className={"text-gray-400"}>changed status to</span>
                <span className={"border-s rounded-full bg-gray-400 px-2"}>
                    {TicketStatus[status]}
                </span>
                <span className={"text-gray-400"}>
                    on {Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    }).format(Date.parse(on ?? "2025-01-23 02:21:36.257"))}
                </span>
            </CardContent>
        </Card>
    );
}
