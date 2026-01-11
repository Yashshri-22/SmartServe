import { useNavigate } from "react-router-dom";
import { FaHandsHelping, FaBuilding, FaGithub, FaEnvelope } from "react-icons/fa";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-12">
        
        {/* MAIN GRID */}
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">

          {/* BRAND */}
          <div>
            <h3 className="text-lg font-semibold tracking-tight text-gray-900">
              SmartServe <span className="text-[#319795]">AI</span>
            </h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-500">
              AI-powered platform connecting volunteers and NGOs for meaningful
              social impact.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {[
                { label: "Home", path: "/" },
                { label: "Sign In", path: "/auth" },
                { label: "Get Started", path: "/auth" },
              ].map((item) => (
                <li
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className="cursor-pointer transition hover:text-[#319795]"
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* FOR YOU */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">
              For You
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li
                onClick={() => navigate("/auth?role=volunteer")}
                className="flex cursor-pointer items-center gap-2 transition hover:text-[#319795]"
              >
                <FaHandsHelping size={14} />
                Volunteers
              </li>
              <li
                onClick={() => navigate("/auth?role=ngo")}
                className="flex cursor-pointer items-center gap-2 transition hover:text-[#319795]"
              >
                <FaBuilding size={14} />
                NGOs
              </li>
            </ul>
          </div>

          {/* CONNECT */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-gray-900">
              Connect
            </h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2 transition hover:text-[#319795]">
                <FaEnvelope size={14} />
                support@SmartServe.ai
              </li>
              <li className="flex items-center gap-2 transition hover:text-[#319795]">
                <FaGithub size={14} />
                GitHub Repository
              </li>
            </ul>
          </div>
        </div>

        {/* DIVIDER */}
        <div className="my-8 h-px w-full bg-gray-200/60" />

        {/* BOTTOM BAR */}
        <div className="flex flex-col items-center justify-between gap-3 text-xs text-gray-500 sm:flex-row">
          <span>© 2026 SmartServe AI. All rights reserved.</span>
          <span className="text-gray-400">
            Built for Google TechSprint 🚀
          </span>
        </div>
      </div>
    </footer>
  );
}
