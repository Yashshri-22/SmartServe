import { useNavigate, useLocation } from "react-router-dom";
import { FaBrain } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleHomeClick = () => {
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md transition-all duration-300 sm:px-10">
      {/* LOGO */}
      <div
        className="flex cursor-pointer items-center gap-2"
        onClick={handleHomeClick}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#319795] to-[#4fd1c5] text-xl font-bold text-white shadow-lg">
          S
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">
          SmartServe <span className="text-[#319795]">AI</span>
        </span>
      </div>

      {/* MIDDLE TABS */}
      <div className="hidden items-center gap-8 md:flex">
        <button
          onClick={handleHomeClick}
          className="!border-1 ! !rounded-full !border-[#319795] text-sm font-medium text-gray-600 transition-colors hover:text-[#319795]"
        >
          Home
        </button>

        <button
          onClick={() => navigate("/about")}
          className="!border-1 ! !rounded-full !border-[#319795] text-sm font-medium text-gray-600 transition-colors hover:text-[#319795]"
        >
          About Us
        </button>

        {/* --- UNIQUE FEATURE: IMPACT PREDICTOR --- */}
        <button
          onClick={() => navigate("/predictor")}
          className="!border-1 ! group flex items-center gap-2 !rounded-full !border-[#319795] text-sm font-bold text-gray-600 transition-colors hover:text-[#319795]"
        >
          <FaBrain className="text-[#319795] transition-transform group-hover:scale-110" />
          Impact Predictor
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        {!session ? (
          <>
            {/* Sign In */}
            <button
              onClick={() => navigate("/auth")}
              className="!rounded-full !border-0 !bg-[#319795] !px-8 !py-2.5 !text-sm !font-semibold !text-white !shadow-md transition-all duration-200 hover:!bg-[#2a8a88] hover:!shadow-lg active:scale-95"
            >
              Sign in
            </button>

            {/* Get Started */}
            <button
              onClick={() => navigate("/auth")}
              className="!rounded-full !border-2 !border-[#319795] !bg-white !px-8 !py-2.5 !text-sm !font-semibold !text-[#319795] !shadow-md transition-all duration-200 hover:!bg-[#e6fffa] hover:!shadow-lg active:scale-95"
            >
              Get Started
            </button>
          </>
        ) : (
          /* Logout */
          <button
            onClick={handleLogout}
            className="!rounded-full !border-2 !border-red-500 !bg-white !px-8 !py-2.5 !text-sm !font-semibold !text-red-600 !shadow-md transition-all duration-200 hover:!bg-red-50 hover:!shadow-lg active:scale-95"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
