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
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-32">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-[#e6fffa] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#319795]">
            AI Projection Tool
          </span>
          <h1 className="mb-4 text-4xl font-extrabold">
            Calculate Your <span className="text-[#319795]">Potential Impact</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Volunteering isn't just about time; it's about value. 
            See the tangible economic and social change you could create in one year.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          
          {/* LEFT: CONTROLS */}
          <div className="rounded-3xl border border-gray-100 bg-white p-8 shadow-xl">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-bold">
              <FaCalculator className="text-gray-400" /> Inputs
            </h3>
            
            <div className="mb-8">
              <label className="mb-2 block text-sm font-semibold text-gray-700">My Primary Skill</label>
              <select 
                value={skill} 
                onChange={(e) => setSkill(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 p-4 outline-none transition-all hover:bg-gray-100 focus:ring-2 focus:ring-[#319795]"
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
                  className="mt-3 w-full rounded-xl border-2 border-[#319795] bg-white p-4 text-gray-700 placeholder-gray-400 focus:outline-none"
                />
              )}
            </div>

            <div className="mb-8">
              <div className="mb-2 flex justify-between">
                <label className="text-sm font-semibold text-gray-700">Hours per Week</label>
                <span className="font-bold text-[#319795]">{hours} Hrs</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="40" 
                value={hours} 
                onChange={(e) => setHours(parseInt(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-[#319795]"
              />
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>1 Hr</span>
                <span>40 Hrs</span>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-700">
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
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#319795] to-[#2c7a7b] p-8 text-white shadow-lg"
            >
              <div className="absolute right-0 top-0 -mr-4 -mt-4 h-32 w-32 rounded-full bg-white opacity-10 blur-2xl"></div>
              <div className="mb-2 flex items-center gap-4">
                <div className="rounded-full bg-white/20 p-3">
                  <FaRupeeSign className="text-2xl" />
                </div>
                <h3 className="font-semibold opacity-90">Economic Value Generated</h3>
              </div>
              <div className="mb-1 text-5xl font-extrabold">
                ₹{(valueCreated).toLocaleString()}
              </div>
              <p className="text-sm opacity-80">Estimated savings for NGOs per year</p>
            </motion.div>

            {/* Social Impact Card */}
            <motion.div 
              key={livesTouched}
              initial={{ scale: 0.95, opacity: 0.5 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-3xl border-2 border-[#319795] bg-white p-8 text-[#319795] shadow-sm"
            >
              <div className="mb-2 flex items-center gap-4">
                <div className="rounded-full bg-[#e6fffa] p-3">
                  <FaUserFriends className="text-2xl" />
                </div>
                <h3 className="font-semibold text-gray-600">Potential Lives Impacted</h3>
              </div>
              <div className="mb-1 text-5xl font-extrabold">
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
              className="group flex w-full items-center justify-center gap-3 !rounded-2xl py-4 text-lg font-bold shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl active:scale-95"
            >
              <FaHeart className="animate-pulse text-red-100" /> 
              Make This Impact Real
              <FaArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}