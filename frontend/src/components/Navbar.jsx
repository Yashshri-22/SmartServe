import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Custom cubic-bezier for a "luxe" feel
      className="fixed left-0 right-0 top-0 z-50 border-b border-gray-100 bg-white/70 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        {/* Brand Logo */}
        <div
          onClick={() => navigate("/")}
          className="group flex cursor-pointer items-center gap-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#319795] shadow-sm transition-transform duration-300 group-hover:rotate-12">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            SmartServe <span className="text-[#319795]">AI</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Sign in */}
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
        </div>
      </div>
    </motion.nav>
  );
}
