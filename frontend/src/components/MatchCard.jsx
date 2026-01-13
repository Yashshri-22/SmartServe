import { motion } from "framer-motion";
import { FaCheckCircle, FaStar, FaMapMarkerAlt, FaClock } from "react-icons/fa";

export default function MatchCard({ volunteer, onContact }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group"
    >
      {/* Header: Name and Score */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-400">
            {volunteer.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{volunteer.name}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1"><FaMapMarkerAlt /> {volunteer.location}</span>
              <span className="flex items-center gap-1"><FaClock /> {volunteer.availability}</span>
            </div>
          </div>
        </div>

        {/* Match Score Badge */}
        <div className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 ${
          volunteer.score >= 90 ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
        }`}>
          <FaStar /> {volunteer.score}% Match
        </div>
      </div>

      {/* AI Explanation Section */}
      <div className="bg-[#e6fffa] rounded-xl p-4 mb-4 border border-[#319795]/20">
        <p className="text-sm text-[#2c7a7b] italic">
          <span className="font-bold not-italic">Why this match? </span>
          "{volunteer.reason}"
        </p>
      </div>

      {/* Skills Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {volunteer.skills.map((skill, index) => (
          <span key={index} className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md border border-gray-200">
            {skill}
          </span>
        ))}
      </div>

      {/* Action Button */}
      <button 
        onClick={() => onContact(volunteer)}
        className="w-full py-2.5 rounded-full border-2 border-[#319795] text-[#319795] font-bold text-sm hover:bg-[#319795] hover:text-white transition-all"
      >
        Contact Volunteer
      </button>
    </motion.div>
  );
}