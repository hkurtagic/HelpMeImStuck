import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";

export default function RequesterTicketOverview() {
    return (
        <div className="space-y-10">
            <div className="flex row-auto justify-end mx-5">
                <Button className="bg-green-500 md:w-1/12 font-bold hover:bg-green-600">New Ticket</Button>
            </div>

            {/* Open Tickets */}
            <Card>
                <CardHeader>
                    <CardTitle>Open Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Card className="bg-blue-100">
                        <CardHeader>
                            <CardTitle>Speaker doesn't work</CardTitle>
                        </CardHeader>
                        <CardContent className>
                            <p>Left Speaker in A.1.02 has no sound!</p>
                        </CardContent>
                    </Card>

                    <Card className="bg-blue-100">
                        <CardHeader>
                            <CardTitle>HDMI cable for office PC in A.3.04 is broken!</CardTitle>
                        </CardHeader>
                        <CardContent className>
                            <p>Someone bit in the cable. Help me!</p>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tickets in Progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>There are no tickets in progress.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Closed Tickets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>There are no closed tickets.</p>
                </CardContent>
            </Card>
        </div>
    );
}
