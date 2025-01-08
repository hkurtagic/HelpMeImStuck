import "./App.css";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "@/pages/LoginPage.tsx";
import DashboardPage from "@/pages/DashboardPage.tsx";
import ActivityPage from "@/pages/ActivityPage.tsx";
import PasswordResetPage from "@/pages/PasswordResetPage.tsx";

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/:dashboard" element={<DashboardPage />} />
              <Route path="/activities" element={<ActivityPage />} />
              <Route path="/password-reset" element={<PasswordResetPage/>} />
          </Routes>
      </BrowserRouter>
  );
}

export default App;
