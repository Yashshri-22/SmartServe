import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { FaCalculator, FaHeart, FaRupeeSign, FaUserFriends, FaArrowRight } from "react-icons/fa";

export default function Predictor() {
  const navigate = useNavigate();
  
  // State
  const [hours, setHours] = useState(5);
  const [skill, setSkill] = useState("teaching");
  const [customSkill, setCustomSkill] = useState(""); 
  
  // Calculation Logic
  const calculateImpact = () => {
    const rates = {
      teaching: 500,
      coding: 1200,
      medical: 1500,
      design: 800,
      legal: 2000,
      writing: 600,
      events: 400,
      general: 300,
      other: 350,
    };

    const rate = rates[skill] || rates.other;
    const yearlyHours = hours * 52;
    const valueCreated = yearlyHours * rate;
    
    const peopleMultipliers = { 
      teaching: 5, coding: 100, medical: 2, design: 50, 
      legal: 1, writing: 200, events: 20, general: 3, other: 5 
    };

    const multiplier = peopleMultipliers[skill] || peopleMultipliers.other;
    const livesTouched = Math.floor(yearlyHours * 0.2 * multiplier); 

    return { valueCreated, livesTouched };
  };

  const { valueCreated, livesTouched } = calculateImpact();

  // Helper to get display name
  const getSkillName = () => {
    if (skill === "other" && customSkill.trim() !== "") return customSkill;
    if (skill === "other") return "your unique skill";
    return skill.charAt(0).toUpperCase() + skill.slice(1);
  };

  return (
    <div className="bg-white min-h-screen text-gray-900">
      <Navbar />
      
      <div className="mx-auto max-w-5xl px-6 pt-32 pb-20">
        <div className="text-center mb-12">
          <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-[#319795] uppercase bg-[#e6fffa] rounded-full">
            AI Projection Tool
          </span>
          <h1 className="text-4xl font-extrabold mb-4">
            Calculate Your <span className="text-[#319795]">Potential Impact</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Volunteering isn't just about time; it's about value. 
            See the tangible economic and social change you could create in one year.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* LEFT: CONTROLS */}
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FaCalculator className="text-gray-400" /> Inputs
            </h3>
            
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-2">My Primary Skill</label>
              <select 
                value={skill} 
                onChange={(e) => setSkill(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#319795] outline-none transition-all cursor-pointer hover:bg-gray-100"
              >
                <option value="coding">Software Development / IT</option>
                <option value="teaching">Teaching / Education</option>
                <option value="medical">Medical / Healthcare</option>
                <option value="legal">Legal / Policy Advocacy</option>
                <option value="design">Graphic Design / Marketing</option>
                <option value="writing">Content Writing / Translation</option>
                <option value="events">Event Management</option>
                <option value="general">General Support / Labor</option>
                <option value="other">Other (Type your own)</option> 
              </select>

              {skill === "other" && (
                <motion.input
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  type="text"
                  placeholder="e.g. Photography, Accounting, Driving..."
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  className="mt-3 w-full p-4 bg-white border-2 border-[#319795] rounded-xl focus:outline-none text-gray-700 placeholder-gray-400"
                />
              )}
            </div>

            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700">Hours per Week</label>
                <span className="text-[#319795] font-bold">{hours} Hrs</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="40" 
                value={hours} 
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#319795]"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>1 Hr</span>
                <span>40 Hrs</span>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700 leading-relaxed border border-blue-100">
              <strong>Did you know?</strong> Skills like <b>{getSkillName()}</b> are in high demand. 
              By donating your time, you save NGOs money they can use for food, shelter, and aid.
            </div>
          </div>

          {/* RIGHT: RESULTS */}
          <div className="flex flex-col gap-6">
            
            {/* Economic Value Card */}
            <motion.div 
              key={valueCreated} 
              initial={{ scale: 0.95, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gradient-to-br from-[#319795] to-[#2c7a7b] text-white p-8 rounded-3xl shadow-lg relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-white/20 rounded-full">
                  <FaRupeeSign className="text-2xl" />
                </div>
                <h3 className="font-semibold opacity-90">Economic Value Generated</h3>
              </div>
              <div className="text-5xl font-extrabold mb-1">
                ₹{(valueCreated).toLocaleString()}
              </div>
              <p className="text-sm opacity-80">Estimated savings for NGOs per year</p>
            </motion.div>

            {/* Social Impact Card */}
            <motion.div 
              key={livesTouched}
              initial={{ scale: 0.95, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white border-2 border-[#319795] text-[#319795] p-8 rounded-3xl shadow-sm"
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-[#e6fffa] rounded-full">
                  <FaUserFriends className="text-2xl" />
                </div>
                <h3 className="font-semibold text-gray-600">Potential Lives Impacted</h3>
              </div>
              <div className="text-5xl font-extrabold mb-1">
                {livesTouched > 1000 ? (livesTouched/1000).toFixed(1) + 'k' : livesTouched}+
              </div>
              <p className="text-sm text-gray-500">People benefited via digital or direct services</p>
            </motion.div>

            {/* FIXED BUTTON: Now matches the Teal Gradient Theme */}
            <button 
              onClick={() => navigate('/auth?role=volunteer')}
              style={{ 
                background: "linear-gradient(135deg, #319795 0%, #2c7a7b 100%)", 
                color: "#ffffff" 
              }} 
              className="group w-full py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <FaHeart className="text-red-100 animate-pulse" /> 
              Make This Impact Real
              <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}