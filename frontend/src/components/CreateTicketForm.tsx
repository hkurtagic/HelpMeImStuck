import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";

export default function CreateTicketForm() {
    return (
        <div className="flex justify-center items-center">
            <Card className="w-full h-screen">
                <CardHeader>
                    <div className="flex flex-row">
                        <Button className="bg-red-500 hover:bg-red-600 w-1/12">Back</Button>
                    </div>
                    <CardTitle className="text-2xl text-center">Create a new Ticket</CardTitle>
                </CardHeader>

                <CardContent className="mx-20">
                    <Label className="text-xl">Title</Label>
                    <Input className="border border-black"></Input>
                </CardContent>
            </Card>
        </div>
    );
}