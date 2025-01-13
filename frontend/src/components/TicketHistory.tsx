import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

interface TicketHistoryProps {
    setView: React.Dispatch<React.SetStateAction<"overview" | "create" | "history">>;
}

export default function TicketHistory ({ setView }: TicketHistoryProps) {
    return (
        <div className="items-center justify-center min-h-screen">
            <Card className="w-full h-screen q-2/3 shadow-lg">
                <CardHeader>
                    <Button className="bg-red-500 hover:bg-red-600 w-1/12 " onClick={() => setView("overview")}>
                        Back
                    </Button>
                    <CardTitle className="text-2xl text-center">Ticket History</CardTitle>
                </CardHeader>

                <CardContent>
                    <p>Das ist die Ticket History</p>
                </CardContent>
            </Card>
        </div>
    );
}