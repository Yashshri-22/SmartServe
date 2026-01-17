import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  FaHandsHelping,
  FaBuilding,
  FaRobot,
  FaPen,
  FaLink,
} from "react-icons/fa";

export default function Landing() {
  const navigate = useNavigate();

  // Animation variants for reusability with a smoother "luxe" feel
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  };

  const AnimatedText = ({ text, className = "" }) => {
    return (
      <span className={className}>
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            animate={{
              color: ["#319795", "#4fd1c5", "#319795"],
            }}
            transition={{
              duration: 3,
              delay: i * 0.07,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    );
  };

  const heroTextFloat = {
    animate: {
      y: [0, -6, 0],
      opacity: [1, 0.96, 1],
    },
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  };

  return (
    <div className="overflow-x-hidden bg-white text-[#1a202c]">
      <div className="min-h-screen overflow-x-hidden bg-white text-[#1a202c]">
        <Navbar />

        {/* ================= HERO SECTION ================= */}
        <section className="relative mx-auto max-w-7xl px-6 pb-20 pt-28 lg:pb-32 lg:pt-24">
          {/* Soft Decorative Background Blur */}
          <div className="absolute -left-10 top-20 -z-10 h-72 w-72 rounded-full bg-[#319795]/5 blur-[100px]" />
          <div className="absolute right-0 top-40 -z-10 h-72 w-72 rounded-full bg-[#319795]/5 blur-[100px]" />

          <div className="grid grid-cols-1 items-center gap-16 lg:min-h-[70vh] lg:grid-cols-2 lg:gap-12">
            {/* TEXT CONTENT */}
            {/* TEXT CONTENT */}
            {/* TEXT CONTENT */}
            {/* TEXT CONTENT */}
            <motion.div
              initial={{ opacity: 0 }}
              animate="animate"
              variants={heroTextFloat}
              // 1. Mobile: Center text | Desktop: Left align text
              // 2. Mobile: mx-auto (center box) | Desktop: mx-0 (snap box to left)
              className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-2xl lg:-translate-y-6 lg:text-left"
            >
              <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight text-gray-900 sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                <AnimatedText text="AI-powered matching " />
                <br />
                <AnimatedText
                  text="Volunteers"
                  className="text-[#319795]"
                  delay={0.3}
                />
                <span> and </span>
                <AnimatedText
                  text="NGOs"
                  className="text-[#319795]"
                  delay={0.8}
                />
              </h1>

              <p className="mx-auto mb-10 max-w-lg leading-relaxed text-gray-500 lg:mx-0">
                SmartServe AI understands real skills and real needs to create
                meaningful volunteering opportunities —{" "}
                <span className="font-medium text-gray-900">
                  intelligently.
                </span>
              </p>

              {/* BUTTON CONTAINER CHANGES */}
              {/* justify-center: Centers buttons on mobile/tablet */}
              {/* lg:justify-start: Aligns buttons to the LEFT on desktop */}
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-center">
                <button
                  onClick={() => navigate("/auth?role=volunteer")}
                  className="flex items-center gap-2 !rounded-full !border-0 !bg-[#319795] !px-10 !py-3.5 !text-base !font-semibold !text-white !shadow-lg transition-all duration-300 hover:-translate-y-1 hover:!bg-[#2a8a88] hover:!shadow-xl active:scale-95"
                >
                  <FaHandsHelping className="text-lg" />
                  Join as Volunteer
                </button>

                <button
                  onClick={() => navigate("/auth?role=ngo")}
                  className="flex items-center gap-2 !rounded-full !border-2 !border-[#319795] !bg-white !px-10 !py-3.5 !text-base !font-semibold !text-[#319795] !shadow-md transition-all duration-300 hover:-translate-y-1 hover:!bg-[#e6fffa] hover:!shadow-lg active:scale-95"
                >
                  <FaBuilding className="text-lg" />
                  Join as NGO
                </button>
              </div>
            </motion.div>

            {/* HERO IMAGE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative flex justify-center lg:translate-y-4"
            >
              <div className="absolute inset-0 -z-10 rounded-full bg-[#319795]/10 blur-3xl" />
              <img
                src="/images/hero.png"
                alt="Volunteering illustration"
                className="relative z-10 w-full max-w-lg drop-shadow-2xl transition-transform duration-700 hover:scale-[1.02]"
              />
            </motion.div>
          </div>
        </section>

        {/* ================= HOW IT WORKS ================= */}
        <section className="bg-gray-50/50">
          <div className="max-w-7xl px-6 !text-center">
            <motion.div {...fadeInUp}>
              <h2 className="mb-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                How SmartServe AI Works
              </h2>
              <div className="mx-auto mb-16 h-1 w-16 rounded-full bg-[#319795]" />
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: "Describe",
                  icon: <FaPen />,
                  text: "Describe your skills or NGO needs naturally in plain text.",
                },
                {
                  title: "AI Understands",
                  icon: <FaRobot />,
                  text: "Our Gemini-powered AI extracts deep context and intent.",
                },
                {
                  title: "Smart Match",
                  icon: <FaLink />,
                  text: "Get high-accuracy matches with explainable scores.",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    delay: i * 0.15,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="group rounded-3xl border border-gray-100 bg-white p-10 shadow-sm transition-all duration-500 hover:-translate-y-3 hover:border-[#319795]/20 hover:shadow-2xl"
                >
                  <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#319795]/10 text-3xl text-[#319795] transition-all duration-300 group-hover:rotate-6 group-hover:bg-[#319795] group-hover:text-white">
                    {item.icon}
                  </div>
                  <h3 className="mb-3 text-xl font-bold tracking-tight text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500 sm:text-base">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ================= IMPACT CTA ================= */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="relative overflow-hidden rounded-[3rem] bg-[#1a202c] px-8 py-16 text-center text-white sm:px-16">
            {/* Soft background accents */}
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#319795]/20 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#319795]/10 blur-3xl" />

            <motion.div {...fadeInUp} className="relative z-10">
              <h2 className="mb-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                Start Creating Impact Today
              </h2>

              <p className="mx-auto mb-8 max-w-2xl text-base leading-relaxed text-gray-300">
                Join volunteers and NGOs using AI to create real social impact —
                faster, smarter, and more meaningful.
              </p>

              <button
                onClick={() => navigate("/auth")}
                className="!hover:scale-105 !rounded-full !bg-white px-10 py-3 text-sm font-semibold !text-[#1a202c] !shadow-md !transition-all duration-200 hover:bg-blue-100 active:scale-95"
              >
                Get Started
              </button>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
