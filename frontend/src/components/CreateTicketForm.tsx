import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import {
	appendAuthHeader,
	EP_department,
	EP_ticket_create,
} from "@/route_helper/routes_helper.tsx";
import { Department, Ticket, TicketStatus } from "@shared/shared_types.ts";
import { UserContext } from "@/components/UserContext";

interface CreateTicketFormProps {
	setView: (view: "overview" | "create") => void;
}

export default function CreateTicketForm({ setView }: CreateTicketFormProps) {
	const { user } = useContext(UserContext);
	// States für Formulardaten
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
	const [departments, setDepartments] = useState<Department[]>([]);
	const [comments, setComments] = useState("");
	const [images, setImages] = useState<Blob[] | []>([]); // Blob für das Bild
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Abteilungen laden
	useEffect(() => {
		fetchDepartments();
	}, []);

	async function fetchDepartments() {
		try {
			const response = await fetch(EP_department, {
				method: "GET",
				credentials: "include",
				headers: appendAuthHeader(),
			});

			if (!response.ok) throw new Error("Failed to fetch departments");

			const data = await response.json();
			setDepartments(data); // Erwartet ein Array von Objekten {id, name}
		} catch (error) {
			console.error("Error fetching departments:", error);
		}
	}


	const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedDept = departments.find((d) => d.department_name == e.target.value) || null;
		setSelectedDepartment(selectedDept);
	};

	// Formular absenden
	const handleSubmit = async () => {
		if (
			!title || !description || !selectedDepartment?.department_name ||
			!selectedDepartment?.department_id
		) {
			alert("Please fill in all required fields!");
			return;
		}

		setIsSubmitting(true);

		try {
			if (user == undefined) {
				throw new Error("User not logged in");
			}
			console.log(user.user_name);
			const ticket: Ticket = {
				ticket_id: "",
				author: user.user_name,
				departments: [
					{
						department_id: selectedDepartment.department_id,
						department_name: selectedDepartment.department_name,
					} as Department,
				],
				title: title,
				description: description,
				status: TicketStatus.OPEN,
			};
			// const formData = new FormData();
			// formData.append("title", title);
			// formData.append("description", description);
			// formData.append("department_name", selected_department.department_name);
			// formData.append("department_id", selected_department.department_id.toString());
			// formData.append("comments", comments);

			if (!images.length) {
				ticket.images = images[0];
				// ticket.images = [];
				// images.forEach((image) => {
				// 	ticket.images!.push(image);
				// 	// formData.append("image_" + String(index), image); // Bild als Blob hinzufügen
				// });
			}
			console.log(ticket);
			const response = await fetch(EP_ticket_create, {
				method: "POST",
				headers: appendAuthHeader(),
				body: JSON.stringify(ticket),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to create ticket");
			}

			alert("Ticket created successfully!");
			setTitle("");
			setDescription("");
			setSelectedDepartment(null);
			setComments("");
			setImages([]);
			setView("overview");
		} catch (error) {
			console.error("Error creating ticket:", error);
			alert("Failed to create the ticket. Please try again later.");
		} finally {
			setIsSubmitting(false);
		}
	};



	return (
		<div className="flex items-center justify-center min-h-screen">
			<Card className="w-full md:w-2/3 lg:w-1/2 shadow-lg">
				<CardHeader>
					<div className="flex flex-row justify-between">
						<Button
							className="bg-red-500 hover:bg-red-600 w-1/5 "
							onClick={() => setView("overview")}
						>
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
							value={selectedDepartment?.department_name || ""}
							onChange={(e) => handleDepartmentChange(e)}
							className="border border-black w-full p-2 rounded-md"
						>
							<option value="" disabled>Select a department</option>
							{departments.map((dept) => (
								<option key={dept.department_id} value={dept.department_name}>
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
							onChange={(e) => {
								const files = e.target.files;
								if (files) {
									const fileNames = [];
									for (let i = 0; i < files.length; i++) {
										fileNames.push(
											new Blob([files[i]], { type: files[i].type }),
										);
									}
									setImages([...images, ...fileNames]);
								}
							}}
						/>
					</div>

					{/* Submit Button */}
					<div className="flex justify-center mt-6">
						<Button
							className={`bg-green-500 hover:bg-green-600 px-6 py-2 text-white font-bold ${
								isSubmitting ? "opacity-50 cursor-not-allowed" : ""
							}`}
							onClick={handleSubmit}
							disabled={isSubmitting}
						>
							{isSubmitting ? "Creating..." : "Create Ticket"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
