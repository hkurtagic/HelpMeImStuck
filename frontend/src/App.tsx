import "./App.css";
import React from "npm:@types/react@^18.3.12";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "@/pages/Login.tsx";
import Dashboard from "@/pages/Dashboard.tsx";

function App() {
  return (
      <BrowserRouter>
          <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/:dashboard" element={<Dashboard />} />
          </Routes>
      </BrowserRouter>
  );
}

export default App;
