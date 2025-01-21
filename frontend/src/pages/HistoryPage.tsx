import { useState } from "react";
import HistoryFeed from "@/components/HistoryFeed.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { Button } from "@/components/ui/button.tsx";

export default function HistoryPage() {
    const [inputText, setInputText] = useState("");

    return (
        <div className="p-4">
            <HistoryFeed/>

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
