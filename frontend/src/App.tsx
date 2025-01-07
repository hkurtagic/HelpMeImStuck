import "./App.css";
import React from "npm:@types/react@^18.3.12";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/LoginPage.tsx";
import DashboardPage from "@/pages/DashboardPage.tsx";
import ActivityPage from "@/pages/ActivityPage.tsx";

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/:dashboard" element={<DashboardPage />} />
              <Route path="/activities" element={<ActivityPage />} />
          </Routes>
      </BrowserRouter>
  );
}

export default App;
