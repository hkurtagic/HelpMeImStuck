import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

export default function StatisticsPage () {
    return (
        <div className="items-center justify-center min-h-screen">
            <Card className="w-full h-screen q-2/3 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Ticket Statistics</CardTitle>
                </CardHeader>

                <CardContent>
                    <p>Das ist Content</p>
                </CardContent>
            </Card>
        </div>
    );
}