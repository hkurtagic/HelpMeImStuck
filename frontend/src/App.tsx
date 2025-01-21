import "@/App.css";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/LoginPage.tsx";
import DashboardPage from "@/pages/DashboardPage.tsx";
import HistoryPage from "@/pages/HistoryPage.tsx";
import StatisticsPage from "@/pages/StatisticsPage.tsx";
import UserContextProvider from "./components/UserContextProvider";
import {dashboardPath, rootPath, ticketHistoryPath, statisticsPath} from "@/route_helper/routes_helper.tsx";

function App() {
	return (
		<UserContextProvider>
			<BrowserRouter>
				<Routes>
					<Route path={rootPath} element={<LoginPage />} />
					<Route path={dashboardPath} element={<DashboardPage />} />
					<Route path={ticketHistoryPath} element={<HistoryPage />} />
					<Route path={statisticsPath} element={<StatisticsPage />} />
				</Routes>
			</BrowserRouter>
		</UserContextProvider>
	);
}

export default App;
