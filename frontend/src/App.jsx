import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Auth from "./pages/Auth";
// import VolunteerDashboard from "./pages/VolunteerDashboard";
// import NgoDashboard from "./pages/NgoDashboard";

function App() {
  const { session, loading } = useAuth();

  if (loading) return <div className="p-4">Loading...</div>;

  if (!session) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/redirect" />} />
        <Route path="/volunteer" element={<VolunteerDashboard />} />
        <Route path="/ngo" element={<NgoDashboard />} />
        <Route path="/redirect" element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

function RoleRedirect() {
  const { session } = useAuth();

  // TEMP: until we fetch role properly
  // You will improve this later
  return <Navigate to="/volunteer" />;
}

export default App;
