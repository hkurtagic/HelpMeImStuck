import { Card, CardContent, CardHeader } from "@/components/ui/card.tsx";
import React from "react";

interface Props {
    user_name: string;
    on: string;
    comment: string;
}

export default function HistoryEventAddComment({ user_name, on, comment }: Props) {
    return (
        <Card className={"ml-3 w-fit mt-10 mb-0"}>
            <CardHeader
                className={"p-3 border-b-2 border-gray-200 flex flex-wrap flex-row items-baseline gap-2 justify-center"}
            >
                <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-[3em] -start-1.5 border border-white dark:border-gray-900 dark:bg-gray-700">
                </div>
                <span>{user_name}</span>
                <span className={"text-gray-400"}>
                    on {Intl.DateTimeFormat("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                    }).format(Date.parse(on))}
                </span>
            </CardHeader>
            <CardContent className={"pt-3"}>
                {comment}
            </CardContent>
        </Card>
    );
}
