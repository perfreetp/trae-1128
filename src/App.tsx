import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Calendar from "@/pages/Calendar";
import Approval from "@/pages/Approval";
import Maintenance from "@/pages/Maintenance";
import Safety from "@/pages/Safety";
import Statistics from "@/pages/Statistics";
import Users from "@/pages/Users";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/approval" element={<Approval />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/users" element={<Users />} />
        </Route>
      </Routes>
    </Router>
  );
}
