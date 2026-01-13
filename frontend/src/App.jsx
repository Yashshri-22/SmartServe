import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Predictor from "./pages/Predictor";
import NgoDashboard from "./pages/NgoDashboard"; // <--- Import this

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
        <Route path="/about" element={<About />} />
        <Route path="/predictor" element={<Predictor />} />

        {/* PROTECTED NGO ROUTE */}
        <Route
          path="/ngo"
          element={session ? <NgoDashboard /> : <Navigate to="/auth" />} 
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;