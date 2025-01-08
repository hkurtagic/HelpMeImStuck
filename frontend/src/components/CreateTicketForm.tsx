import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

interface CreateTicketFormProps {
    setView: (view: 'overview' | 'create') => void;
}

export default function CreateTicketForm({ setView }: CreateTicketFormProps) {
    // States für Formulardaten
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState('');
    const [departments, setDepartments] = useState<string[]>([]);
    const [comments, setComments] = useState('');
    const [image, setImage] = useState<Blob | null>(null); // Blob für das Bild
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Abteilungen laden
    useEffect(() => {
        async function fetchDepartments() {
            try {
                const response = await fetch(import.meta.env.VITE_BACKEND_API + '/departments');
                if (!response.ok) throw new Error('Failed to fetch departments');
                const data = await response.json();
                setDepartments(data.departments || []);
            } catch (error) {
                console.error('Error fetching departments:', error);
            }
        }
        fetchDepartments();
    }, []);

    // Formular absenden
    const handleSubmit = async () => {
        if (!title || !description || !department) {
            alert('Please fill in all required fields!');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('department', department);
            formData.append('comments', comments);

            if (image) {
                formData.append('image', image); // Bild als Blob hinzufügen
            }

            const response = await fetch(import.meta.env.VITE_BACKEND_API + '/tickets', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create ticket');
            }

            alert('Ticket created successfully!');
            setTitle('');
            setDescription('');
            setDepartment('');
            setComments('');
            setImage(null);
            setView('overview');
        } catch (error) {
            console.error('Error creating ticket:', error);
            alert('Failed to create the ticket. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full md:w-2/3 lg:w-1/2 shadow-lg">
                <CardHeader>
                    <div className="flex flex-row justify-between">
                        <Button className="bg-red-500 hover:bg-red-600" onClick={() => setView('overview')}>
                            Back
                        </Button>
                    </div>
                    <CardTitle className="text-2xl text-center">Create a New Ticket</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div>
                        <Label className="text-xl">Title</Label>
                        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter the ticket title" />
                    </div>
                    <div>
                        <Label className="text-xl">Description</Label>
                        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter a detailed description" />
                    </div>
                    <div>
                        <Label className="text-xl">Department</Label>
                        <select value={department} onChange={(e) => setDepartment(e.target.value)} className="border border-black w-full p-2 rounded-md">
                            <option value="" disabled>Select a department</option>
                            {departments.map((dept) => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label className="text-xl">Comments</Label>
                        <Input value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Additional comments" />
                    </div>
                    <div>
                        <Label className="text-xl">Upload Image</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files?.[0] || null)}
                        />
                    </div>
                    <div className="flex justify-center mt-6">
                        <Button
                            className={`bg-green-500 hover:bg-green-600 px-6 py-2 text-white font-bold ${
                                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Ticket'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
