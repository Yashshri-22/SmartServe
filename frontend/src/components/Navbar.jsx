import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBrain, FaBars, FaTimes } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session } = useAuth();

  // 🔹 NEW: mobile menu state
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMenuOpen(false);
    navigate("/");
  };

  const handleHomeClick = () => {
    setMenuOpen(false);
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const goTo = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4 sm:px-10">
        {/* LOGO (UNCHANGED) */}
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

        {/* MIDDLE TABS — DESKTOP ONLY (UNCHANGED) */}
        <div className="hidden items-center gap-8 md:flex">
          <button
            onClick={handleHomeClick}
            className="!border-1 ! !rounded-full !border-[#319795] bg-white text-sm font-medium text-gray-600 transition-colors hover:text-[#319795]"
          >
            Home
          </button>

          <button
            onClick={() => goTo("/about")}
            className="!border-1 !rounded-full !border-[#319795] bg-white text-sm font-medium text-gray-600 transition-colors hover:text-[#319795]"
          >
            About Us
          </button>

          <button
            onClick={() => goTo("/predictor")}
            className="!border-1 group flex items-center gap-2 !rounded-full !border-[#319795] bg-white text-sm font-bold text-gray-600 transition-colors hover:text-[#319795]"
          >
            <FaBrain className="text-[#319795] transition-transform group-hover:scale-110" />
            Impact Predictor
          </button>
        </div>

        {/* RIGHT SIDE — DESKTOP ONLY (UNCHANGED) */}
        <div className="hidden items-center gap-4 md:flex">
          {!session ? (
            <>
              <button
                onClick={() => goTo("/auth")}
                className="!rounded-full !border-0 !bg-[#319795] !px-8 !py-2.5 !text-sm !font-semibold !text-white !shadow-md transition-all duration-200 hover:!bg-[#2a8a88] hover:!shadow-lg active:scale-95"
              >
                Sign in
              </button>

              <button
                onClick={() => goTo("/auth")}
                className="!rounded-full !border-2 !border-[#319795] !bg-white !px-8 !py-2.5 !text-sm !font-semibold !text-[#319795] !shadow-md transition-all duration-200 hover:!bg-[#e6fffa] hover:!shadow-lg active:scale-95"
              >
                Get Started
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="!rounded-full !border-2 !border-red-500 !bg-white !px-8 !py-2.5 !text-sm !font-semibold !text-red-600 !shadow-md transition-all duration-200 hover:!bg-red-50 hover:!shadow-lg active:scale-95"
            >
              Logout
            </button>
          )}
        </div>

        {/* 🔹 NEW: HAMBURGER (MOBILE ONLY) */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="!rounded-lg !bg-gray-100 p-2 text-2xl !text-[#319795] hover:bg-gray-200 dark:bg-gray-800 dark:!text-[#319795] dark:hover:bg-gray-700 md:hidden"
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* 🔹 NEW: MOBILE MENU */}
      {menuOpen && (
        <div className="mx-4 mt-4 space-y-4 !rounded-2xl border !border-gray-200 !bg-white px-6 py-6 shadow-xl dark:border-gray-700 dark:bg-gray-900 md:hidden">
          <button
            onClick={handleHomeClick}
            className="flex w-full items-center !rounded-xl !bg-gray-50 px-4 py-3 text-left text-sm font-medium !text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Home
          </button>

          <button
            onClick={() => goTo("/about")}
            className="flex w-full items-center !rounded-xl !bg-gray-50 px-4 py-3 text-left text-sm font-medium !text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            About Us
          </button>

          <button
            onClick={() => goTo("/predictor")}
            className="!hover:bg-gray-100 !dark:hover:bg-gray-700 !dark:text-gray-200 flex w-full items-center gap-2 whitespace-nowrap rounded-xl !bg-gray-50 px-4 py-3 text-sm font-bold !text-gray-700 dark:bg-gray-800"
          >
            <FaBrain className="shrink-0 text-[#319795]" />
            <span>Impact Predictor</span>
          </button>

          <div className="!dark:border-gray-700 space-y-3 border-t !border-gray-200 pt-6">
            {!session ? (
              <>
                <button
                  onClick={() => goTo("/auth")}
                  className="my-3 w-full !rounded-full !bg-[#319795] !py-2.5 !text-sm !font-semibold !text-white"
                >
                  Sign in
                </button>

                <button
                  onClick={() => goTo("/auth")}
                  className="w-full !rounded-full !border-2 !border-[#319795] bg-white !py-2.5 !text-sm !font-semibold !text-[#319795]"
                >
                  Get Started
                </button>
              </>
            ) : (
              <button
                onClick={handleLogout}
                className="w-full !rounded-full !border-2 !border-red-500 bg-white !py-2.5 !text-sm !font-semibold !text-red-600"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
