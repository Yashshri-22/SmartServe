import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaRobot, FaHeart, FaChartLine, FaArrowRight } from "react-icons/fa";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="bg-white overflow-x-hidden font-sans text-[#1a202c]">
      <Navbar />

      {/* ================= SECTION 1: HEADER HERO ================= */}
      <div className="relative pt-36 pb-20 sm:pt-44 px-6 text-center">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-[#319795]/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-40 right-1/4 w-96 h-96 bg-[#4fd1c5]/10 rounded-full blur-3xl -z-10"></div>

        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeInUp}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-gray-900">
            We Are Bridging the Gap Between <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#319795] to-[#4fd1c5]">
               Good Intentions & Real Impact.
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            SmartServe AI isn't just a platform; it's a movement to modernize 
            volunteering using the power of artificial intelligence and human empathy.
          </p>
        </motion.div>
      </div>

      {/* ================= SECTION 2: THE STORY ================= */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true, margin: "-100px" }}
             variants={fadeInUp}
          >
            <h4 className="text-[#319795] font-bold tracking-wider uppercase mb-4">Our Story</h4>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
              The Problem isn't a lack of volunteers. <br/> It's a mismatch of skills.
            </h2>
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              For years, we watched amazing NGOs struggle to find specific talent, while skilled professionals (like coders, designers, and doctors) wanted to help but couldn't find the right opportunity.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              Traditional platforms were just bulletin boards. We knew that to create real change, we needed something smarter—something that understands the *nuance* of a skill and the *urgency* of a cause.
            </p>
            <div className="inline-flex items-center gap-2 text-[#319795] font-bold text-lg border-b-2 border-[#319795] pb-1">
              Enter SmartServe AI <FaArrowRight />
            </div>
          </motion.div>

          {/* IMAGE */}
          <motion.div
             initial={{ opacity: 0, x: 50 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             transition={{ duration: 0.8 }}
             className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#319795]/20 to-transparent rounded-[3rem] blur-2xl transform rotate-3 scale-105 -z-10"></div>
            
            <img 
              src="/images/about-team.jpg" 
              alt="SmartServe Team" 
              className="rounded-[2.5rem] shadow-2xl w-full object-cover h-[500px] border-4 border-white relative z-10"
            />
          </motion.div>
        </div>
      </section>

      {/* ================= SECTION 3: CORE PILLARS ================= */}
      <section className="py-20 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div 
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             variants={staggerContainer}
             className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">What Drives Us</h2>
            <div className="w-20 h-1.5 bg-[#319795] mx-auto mt-4 rounded-full"></div>
          </motion.div>

          <motion.div 
             variants={staggerContainer}
             initial="hidden"
             whileInView="visible"
             viewport={{ once: true }}
             className="grid md:grid-cols-3 gap-10"
          >
            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-[#e6fffa] rounded-2xl flex items-center justify-center text-[#319795] text-3xl mb-6">
                <FaRobot />
              </div>
              <h3 className="text-xl font-bold mb-4">Intelligent Matching</h3>
              <p className="text-gray-600 leading-relaxed">We use advanced Gemini AI to understand the context of needs, ensuring high-quality, lasting connections.</p>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 text-3xl mb-6">
                <FaHeart />
              </div>
              <h3 className="text-xl font-bold mb-4">Human-Centric Empathy</h3>
              <p className="text-gray-600 leading-relaxed">Technology is just the tool. Our focus remains on the human connection and the dignity of the causes we serve.</p>
            </motion.div>

            <motion.div variants={fadeInUp} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-2">
              <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-500 text-3xl mb-6">
                <FaChartLine />
              </div>
              <h3 className="text-xl font-bold mb-4">Measurable Impact</h3>
              <p className="text-gray-600 leading-relaxed">We move beyond "hours volunteered" to track real outcomes, economic value generated, and lives affected.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

       {/* ================= SECTION 4: MISSION BANNER ================= */}
       <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#319795] opacity-[0.03] -z-10"></div>
        <div className="absolute -left-20 bottom-0 w-64 h-64 bg-[#319795]/10 rounded-full blur-3xl -z-10"></div>
        <motion.div 
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true }}
           variants={fadeInUp}
           className="max-w-4xl mx-auto text-center"
        >
            <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-8 text-gray-900">
              "Our mission is to ensure that <br/> 
              <span className="text-[#319795]">no skill goes to waste</span> while <br/>
              an NGO is waiting for help."
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              
              {/* FIXED BUTTON: Uses inline style to FORCE black background */}
              <button 
                onClick={() => navigate('/auth')}
                style={{ backgroundColor: "#111827", color: "#ffffff" }}
                className="px-10 py-4 text-lg font-bold rounded-full shadow-xl hover:opacity-90 transition-all hover:-translate-y-1 hover:shadow-2xl"
              >
                Join Our Mission
              </button>

            </div>
        </motion.div>
       </section>

      <Footer />
    </div>
  );
}