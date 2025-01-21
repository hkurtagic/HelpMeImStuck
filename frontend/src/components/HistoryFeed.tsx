import React from "react";
import { FlagTriangleRight } from "lucide-react";

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
    return (
        <>
            <ul
                aria-label="Activity feed"
                role="feed"
                className="relative flex flex-col gap-12 py-12 pl-6 before:absolute before:top-0 before:left-6 before:h-full before:-translate-x-1/2 before:border before:border-dashed before:border-slate-200 after:absolute after:top-6 after:left-6 after:bottom-6 after:-translate-x-1/2 after:border after:border-slate-200"
            >
                {history.map((item, index) => (
                    <li key={index} role="article" className="relative pl-6">
                        <span className="absolute left-0 z-10 flex items-center justify-center w-8 h-8 -translate-x-1/2 rounded-full bg-slate-200 text-slate-700 ring-2 ring-white">
                            <FlagTriangleRight className="w-4 h-4" />
                        </span>
                        <div className="flex flex-col flex-1 gap-2 bg-gray-800 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-white">
                                {item.author} created a ticket: "{item.title}"
                            </h4>
                            <p className="text-xs text-gray-400">{item.timestamp}</p>
                            <p className="text-sm text-white"><strong>Description:</strong> {item.description}</p>
                            <p className="text-sm text-gray-300"><strong>Comments:</strong> {item.comments || "No comments"}</p>
                            {item.image && (
                                <img src={item.image} alt="Uploaded" className="w-32 h-32 object-cover rounded-md mt-2" />
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </>
    );
}
