import { useNavigate, useLocation } from "react-router-dom";
import { FaBrain } from "react-icons/fa"; 

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeClick = () => {
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white/80 px-6 py-4 backdrop-blur-md transition-all duration-300 sm:px-10 border-b border-gray-100">
      {/* LOGO */}
      <div 
        className="flex cursor-pointer items-center gap-2" 
        onClick={handleHomeClick}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#319795] to-[#4fd1c5] text-white font-bold text-xl shadow-lg">
          S
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">
          SmartServe <span className="text-[#319795]">AI</span>
        </span>
      </div>

      {/* MIDDLE TABS */}
      <div className="hidden md:flex items-center gap-8">
        <button 
          onClick={handleHomeClick}
          className="text-sm font-medium text-gray-600 hover:text-[#319795] transition-colors !rounded-full !border-1 !border-[#319795] !"
        >
          Home
        </button>

        <button 
          onClick={() => navigate('/about')}
          className="text-sm font-medium text-gray-600 hover:text-[#319795] transition-colors !rounded-full !border-1 !border-[#319795] !"
        >
          About Us
        </button>

        {/* --- UNIQUE FEATURE: IMPACT PREDICTOR --- */}
        <button 
          onClick={() => navigate('/predictor')} 
          className="group flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-[#319795] transition-colors !rounded-full !border-1 !border-[#319795] !"
        >
          <FaBrain className="text-[#319795] group-hover:scale-110 transition-transform" />
          Impact Predictor
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
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
    </nav>
  );
}