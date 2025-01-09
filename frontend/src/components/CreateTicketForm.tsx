import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {EP_department} from "@/route_helper/routes_helper.tsx";
import { Department } from "@shared/shared_types.ts";

interface CreateTicketFormProps {
    setView: (view: 'overview' | 'create') => void;
}

interface Department {
    id: string;
    name: string;
}

export default function CreateTicketForm({ setView }: CreateTicketFormProps) {
    // States für Formulardaten
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [department, setDepartment] = useState<Department | null>(null);
    const [departments, setDepartments] = useState<string[]>([]);
    const [comments, setComments] = useState('');
    const [image, setImage] = useState<Blob | null>(null); // Blob für das Bild
    const [isSubmitting, setIsSubmitting] = useState(false);


    // Abteilungen laden
    useEffect(() => {
        //if (!departments) {
            fetchDepartments();
        //}
    }, []);

    async function fetchDepartments() {
        try {
            const response = await fetch(EP_department);
            if (!response.ok) throw new Error('Failed to fetch departments');
            const data = await response.json();
            setDepartments(data); // Erwartet ein Array von Objekten {id, name}
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    }


    const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedDept = JSON.parse(e.target.value);
        setDepartment(selectedDept);
    };



    // Formular absenden
    const handleSubmit = async () => {
        if (!title || !description || !department?.name || !department?.id) {
            alert('Please fill in all required fields!');
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('department_name', department.name);
            formData.append('department_id', department.id);
            formData.append('comments', comments);

            if (image) {
                formData.append('image', image); // Bild als Blob hinzufügen
            }

            const response = await fetch(EP_department, {
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
            setDepartment(null);
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
                        <Button className="bg-red-500 hover:bg-red-600 w-1/5 " onClick={() => setView('overview')}>
                            Back
                        </Button>
                    </div>
                    <CardTitle className="text-2xl text-center">Create a New Ticket</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    {/* Title Input */}
                    <div>
                        <Label className="text-xl">Title</Label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter the ticket title"
                        />
                    </div>

                    {/* Description Input */}
                    <div>
                        <Label className="text-xl">Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter a detailed description"
                        />
                    </div>

                    {/* Department Dropdown */}
                    <div>
                        <Label className="text-xl">Department</Label>
                        <select
                            value={department || ''}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="border border-black w-full p-2 rounded-md"
                        >
                            <option value="" disabled>Select a department</option>
                            {departments.map((dept) => (
                                <option key={dept.pk_department_id} value={dept.pk_department_id}>
                                    {dept.department_name}
                                </option>
                            ))}
                        </select>

                    </div>

                    {/* Comments Input */}
                    <div>
                        <Label className="text-xl">Comments</Label>
                        <Input
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Additional comments"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <Label className="text-xl">Upload Image</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImage(e.target.files || null)}
                        />
                    </div>

                    {/* Submit Button */}
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
