import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useNavigate } from "react-router-dom"

export default function PasswordChangeForm() {
    // states for input
    const [username, setUsername] = useState<string>("");
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();

    const handleBackButton = () => {
        navigate("/");
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); // stops site-reload
        setError(null);
        setSuccess(null);

        // validation
        if (!username.trim()) {
            setError("Username is required.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    currentPassword,
                    newPassword,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to change password. Please try again.");
            }

            setSuccess("Password successfully changed!");
            setUsername("");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Change Password</CardTitle>
                <CardDescription>
                    Please enter your username, current password, and a new password to update your credentials.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">
                        {/* Username */}
                        <div className="grid gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>

                        {/* Old Password */}
                        <div className="grid gap-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* New password */}
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Passwort bestätigen */}
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>

                        {/* Fehleranzeige */}
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        {/* Erfolgsmeldung */}
                        {success && <div className="text-green-500 text-sm">{success}</div>}

                        {/* Submit-Button */}
                        <button
                            type="submit"
                            className={`w-full bg-fuchsia-800 hover:bg-fuchsia-900 text-white font-bold py-2 px-4 rounded ${
                                loading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={loading}
                        >
                            {loading ? "Changing Password..." : "Change Password"}
                        </button>

                        <button className={"w-full bg-gray-300 hover:bg-gray-400 text-black"} onClick={handleBackButton}>
                            Back to Login
                        </button>

                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
