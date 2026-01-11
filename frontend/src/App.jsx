import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
// Uncomment these when dashboards are ready
// import VolunteerDashboard from "./pages/VolunteerDashboard";
// import NgoDashboard from "./pages/NgoDashboard";

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        {/* PROTECTED ROUTES (enable later) */}
        {/* 
        <Route
          path="/volunteer"
          element={session ? <VolunteerDashboard /> : <Navigate to="/auth" />}
        />
        <Route
          path="/ngo"
          element={session ? <NgoDashboard /> : <Navigate to="/auth" />}
        />
        */}

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
