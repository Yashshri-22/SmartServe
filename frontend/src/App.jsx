import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// --- IMPORT PAGES ---
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Predictor from "./pages/Predictor";
import NgoDashboard from "./pages/NgoDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard"; // <--- Import Volunteer Dashboard

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-teal-600 font-bold">
        Loading SmartServe...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/about" element={<About />} />
        <Route path="/predictor" element={<Predictor />} />

        {/* ================= PROTECTED ROUTES ================= */}
       
        {/* 1. NGO Dashboard Route */}
        <Route
          path="/ngo"
          element={session ? <NgoDashboard /> : <Navigate to="/auth" />}
        />

        {/* 2. Volunteer Dashboard Route (NEW) */}
        <Route
          path="/volunteer"
          element={session ? <VolunteerDashboard /> : <Navigate to="/auth" />}
        />

        {/* ================= FALLBACK ================= */}
        {/* Redirect unknown URLs to Landing Page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

