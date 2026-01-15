import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaRobot, FaHeart, FaChartLine, FaArrowRight } from "react-icons/fa";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-hidden bg-white font-sans text-[#1a202c]">
      <Navbar />

      {/* ================= SECTION 1: HEADER HERO ================= */}
      <div className="relative px-6 py-20 text-center sm:pt-60">
        <div className="absolute left-1/4 top-20 -z-10 h-72 w-72 rounded-full bg-[#319795]/10 blur-3xl"></div>
        <div className="absolute right-1/4 top-40 -z-10 h-96 w-96 rounded-full bg-[#4fd1c5]/10 blur-3xl"></div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="mx-auto max-w-4xl"
        >
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            We Are Bridging the Gap Between <br />
            <span className="bg-gradient-to-r from-[#319795] to-[#4fd1c5] bg-clip-text text-transparent">
              Good Intentions & Real Impact.
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-600">
            SmartServe AI isn't just a platform; it's a movement to modernize
            volunteering using the power of artificial intelligence and human
            empathy.
          </p>
        </motion.div>
      </div>

      {/* ================= SECTION 2: THE STORY ================= */}
      <section className="relative px-6 py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <h4 className="mb-4 font-bold uppercase tracking-wider text-[#319795]">
              Our Story
            </h4>
            <h2 className="mb-6 text-3xl font-bold leading-tight sm:text-4xl">
              The Problem isn't a lack of volunteers. <br /> It's a mismatch of
              skills.
            </h2>
            <p className="mb-6 text-lg leading-relaxed text-gray-600">
              For years, we watched amazing NGOs struggle to find specific
              talent, while skilled professionals (like coders, designers, and
              doctors) wanted to help but couldn't find the right opportunity.
            </p>
            <p className="mb-8 text-lg leading-relaxed text-gray-600">
              Traditional platforms were just bulletin boards. We knew that to
              create real change, we needed something smarter—something that
              understands the *nuance* of a skill and the *urgency* of a cause.
            </p>
            <div className="inline-flex items-center gap-2 border-b-2 border-[#319795] pb-1 text-lg font-bold text-[#319795]">
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
            <div className="absolute inset-0 -z-10 rotate-3 scale-105 transform rounded-[3rem] bg-gradient-to-tr from-[#319795]/20 to-transparent blur-2xl"></div>

            <img
              src="/images/about.png"
              alt="SmartServe Team"
              className="relative z-10 h-[500px] w-full rounded-[2.5rem] border-4 border-white bg-white object-contain shadow-2xl"
            />
          </motion.div>
        </div>
      </section>

      {/* ================= SECTION 3: CORE PILLARS ================= */}
      <section className="bg-gray-50/50 px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold sm:text-4xl">What Drives Us</h2>
            <div className="mx-auto mt-4 h-1.5 w-20 rounded-full bg-[#319795]"></div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid gap-10 md:grid-cols-3"
          >
            <motion.div
              variants={fadeInUp}
              className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e6fffa] text-3xl text-[#319795]">
                <FaRobot />
              </div>
              <h3 className="mb-4 text-xl font-bold">Intelligent Matching</h3>
              <p className="leading-relaxed text-gray-600">
                We use advanced Gemini AI to understand the context of needs,
                ensuring high-quality, lasting connections.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-3xl text-red-500">
                <FaHeart />
              </div>
              <h3 className="mb-4 text-xl font-bold">Human-Centric Empathy</h3>
              <p className="leading-relaxed text-gray-600">
                Technology is just the tool. Our focus remains on the human
                connection and the dignity of the causes we serve.
              </p>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-50 text-3xl text-yellow-500">
                <FaChartLine />
              </div>
              <h3 className="mb-4 text-xl font-bold">Measurable Impact</h3>
              <p className="leading-relaxed text-gray-600">
                We move beyond "hours volunteered" to track real outcomes,
                economic value generated, and lives affected.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================= SECTION 4: MISSION BANNER ================= */}
      <section className="relative overflow-hidden px-6 py-24">
        <div className="absolute inset-0 -z-10 bg-[#319795] opacity-[0.03]"></div>
        <div className="absolute -left-20 bottom-0 -z-10 h-64 w-64 rounded-full bg-[#319795]/10 blur-3xl"></div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="mb-8 text-3xl font-extrabold leading-tight text-gray-900 sm:text-5xl">
            "Our mission is to ensure that <br />
            <span className="text-[#319795]">
              no skill goes to waste
            </span> while <br />
            an NGO is waiting for help."
          </h2>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            {/* FIXED BUTTON: Uses inline style to FORCE black background */}
            <button
              onClick={() => navigate("/auth")}
              style={{ backgroundColor: "#111827", color: "#ffffff" }}
              className="m-5 !rounded-full px-10 text-lg font-bold shadow-xl transition-all hover:-translate-y-1 hover:opacity-90 hover:shadow-2xl"
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
