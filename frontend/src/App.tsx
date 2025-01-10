import "@/App.css";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/LoginPage.tsx";
import DashboardPage from "@/pages/DashboardPage.tsx";
import ActivityPage from "@/pages/ActivityPage.tsx";
import PasswordResetPage from "@/pages/PasswordResetPage.tsx";
import StatisticsPage from "@/pages/StatisticsPage.tsx";
import UserContextProvider from "./components/UserContextProvider";

function App() {
	return (
		<UserContextProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<LoginPage />} />
					<Route path="/:dashboard" element={<DashboardPage />} />
					<Route path="/activities" element={<ActivityPage />} />
					<Route path="/password-reset" element={<PasswordResetPage />} />
					<Route path="/statistics" element={<StatisticsPage />} />
				</Routes>
			</BrowserRouter>
		</UserContextProvider>
	);
}

export default App;
