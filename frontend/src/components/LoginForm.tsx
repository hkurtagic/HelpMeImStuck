import React, { useContext, useState } from "react";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { appendAuthHeader, dashboardPath, EP_login } from "@/route_helper/routes_helper.tsx";
import { useNavigate } from "react-router-dom";
import { User } from "@shared/shared_types";
import { UserContext } from "@/components/UserContext";

export function LoginForm({ className, ...props }: ComponentPropsWithoutRef<"div">) {
    const { updateUser } = useContext(UserContext);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(EP_login, {
                method: "POST",
                credentials: "include",
                headers: appendAuthHeader({
                    "Content-Type": "application/json",
                }),
                body: JSON.stringify({ user_name: username, password }),
            });

            if (!response.ok) {
                throw new Error("Login failed. Please try again");
            }

            const data = await response.json() as User;
            updateUser(data);
            const auth = response.headers.get("Authorization");
            if (auth) {
                window.sessionStorage.setItem("Authorization", auth);
            }
            // console.log("login data" + JSON.stringify(data));
            navigate(dashboardPath);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Login</CardTitle>
                    <CardDescription>
                        Please enter your employee account information to login.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            void handleSubmit(e);
                        }}
                    >
                        <div className="flex flex-col gap-6">
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

                            <div className="grid gap-2">
                                <Label htmlFor="password">Password</Label>

                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {error && <div className="text-red-500 text-sm">{error}</div>}

                            <button
                                type="submit"
                                className={`w-full bg-fuchsia-800 hover:bg-fuchsia-900 text-white ${
                                    loading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                                disabled={loading}
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
