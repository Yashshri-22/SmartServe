import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

import {
  FaRobot,
  FaMapMarkerAlt,
  FaSearch,
  FaClock,
  FaPencilAlt,
  FaCalendarAlt,
  FaBuilding,
  FaCheckCircle,
  FaUser,
  FaFileUpload,
  FaPhoneAlt,
  FaBriefcase,
  FaCheck,
  FaEnvelope,
} from "react-icons/fa";

// --- 1. UPGRADED AI SKILL DETECTION (Better Logic) ---
const getDetectedSkills = (text) => {
  if (!text) return [];
  const lowerText = text.toLowerCase();
  let skills = [];

  // Education
  if (lowerText.includes("teach") || lowerText.includes("tutor"))
    skills.push("Teaching");
  if (lowerText.includes("math")) skills.push("Math");
  if (lowerText.includes("science")) skills.push("Science");
  if (lowerText.includes("kid") || lowerText.includes("child"))
    skills.push("Childcare");

  // Arts & Music
  if (lowerText.includes("photo") || lowerText.includes("camera"))
    skills.push("Photography");
  if (lowerText.includes("dance") || lowerText.includes("dancing"))
    skills.push("Dancing");
  if (
    lowerText.includes("sing") ||
    lowerText.includes("music") ||
    lowerText.includes("song")
  )
    skills.push("Singing/Music");
  if (
    lowerText.includes("paint") ||
    lowerText.includes("draw") ||
    lowerText.includes("art")
  )
    skills.push("Art");

  // Tech
  if (
    lowerText.includes("web") ||
    lowerText.includes("code") ||
    lowerText.includes("react")
  )
    skills.push("Web Development");
  if (lowerText.includes("video") || lowerText.includes("edit"))
    skills.push("Video Editing");

  // Logistics
  if (lowerText.includes("drive") || lowerText.includes("car"))
    skills.push("Driving");
  if (lowerText.includes("food") || lowerText.includes("cook"))
    skills.push("Cooking");

  return [...new Set(skills)];
};

export default function VolunteerDashboard() {
  const { session } = useAuth();

  // --- STATE ---
  const [profileComplete, setProfileComplete] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  // Profile Form (Identity Only)
  const [fullName, setFullName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [experience, setExperience] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Dashboard (Preferences & Skills)
  const [description, setDescription] = useState("");
  const [availability, setAvailability] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");

  const [detectedSkills, setDetectedSkills] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [appliedPostIds, setAppliedPostIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Interview State
  const [interviews, setInterviews] = useState([]);

  // --- 1. CHECK PROFILE ON LOAD ---
  useEffect(() => {
    if (!session?.user) return;

    checkProfile();
    fetchApplications();
    fetchInterviews();

    const channel = supabase
      .channel("applications-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "applications",
          filter: `volunteer_id=eq.${session.user.id}`,
        },
        () => {
          fetchInterviews(); // 🔥 realtime update
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const checkProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("volunteers")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (data && data.full_name && data.contact_no) {
        setProfileComplete(true);
        setFullName(data.full_name);
        setContactNo(data.contact_no);

        // Load saved preferences
        if (data.interest) setDescription(data.interest);
        if (data.location) setLocation(data.location);
        if (data.availability) setAvailability(data.availability);
        if (data.email) setEmail(data.email);
        else setEmail(session.user.email);

        if (data.interest) {
          const skills = getDetectedSkills(data.interest);
          setDetectedSkills(skills);
          // Fetch opportunities using the LOADED skills immediately
          fetchOpportunities(data.location, skills);
        } else {
          fetchOpportunities();
        }
      } else {
        setProfileComplete(false);
      }
    } catch (error) {
      setProfileComplete(false);
    } finally {
      setCheckingProfile(false);
    }
  };

  const generateGoogleCalendarLink = (interview) => {
    const startDate = new Date(
      `${interview.interview_date}T${interview.interview_time}`
    );

    const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 mins

    const format = (date) => date.toISOString().replace(/[-:]|\.\d{3}/g, "");

    const details = `
Interview with ${interview.ngos?.org_name}
Location: ${interview.ngos?.location || "Online"}
Meet: ${interview.meet_link}
  `;

    return `https://calendar.google.com/calendar/render?action=TEMPLATE
&text=NGO Interview – ${encodeURIComponent(interview.ngos?.org_name || "")}
&dates=${format(startDate)}/${format(endDate)}
&details=${encodeURIComponent(details)}
&location=${encodeURIComponent(interview.meet_link)}`;
  };

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `
        id,
        interview_date,
        interview_time,
        meet_link,
        interview_status,
        ngos (
          org_name,
          location
        )
      `
        )
        .eq("volunteer_id", session.user.id)
        .eq("interview_status", "scheduled")
        .order("interview_date", { ascending: true });

      if (error) throw error;
      setInterviews(data || []);
    } catch (error) {
      console.error("Error fetching interviews:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("ngo_post_id")
        .eq("volunteer_id", session.user.id);

      if (error) throw error;
      setAppliedPostIds(data.map((app) => app.ngo_post_id));
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    if (value === "" || /^[0-9\b]+$/.test(value)) {
      setContactNo(value);
    }
  };

  // --- 2. CREATE PROFILE ---
  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!fullName || !contactNo || !experience || !resumeFile) {
      return alert("Please fill all fields and upload a resume.");
    }

    if (contactNo.length !== 10) {
      return alert("Contact number must be exactly 10 digits.");
    }

    setUploading(true);
    try {
      // FIX: Added backticks for template literal
      const fileExt = resumeFile.name.split(".").pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("resumes")
        .upload(fileName, resumeFile);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("resumes").getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("volunteers").upsert(
        {
          user_id: session.user.id,
          full_name: fullName,
          contact_no: contactNo,
          experience: experience,
          resume_url: publicUrl,
          email: session.user.email,
          location: "",
          interest: "",
          availability: "",
          ai_skills: [],
        },
        { onConflict: "user_id" }
      );

      if (dbError) throw dbError;

      alert("Profile Created! Now tell us how you want to help.");
      setProfileComplete(true);
    } catch (error) {
      alert("Error creating profile: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  // --- 3. LIVE SKILL DETECTION ---
  useEffect(() => {
    const skills = getDetectedSkills(description);
    setDetectedSkills(skills);
  }, [description]);

  // --- 4. FIND OPPORTUNITIES (STRICT MATCHING FIX) ---
  const handleFindOpportunities = async () => {
    if (!description)
      return alert("Please describe how you want to help first.");

    setLoading(true);
    try {
      const currentSkills = getDetectedSkills(description);
      setDetectedSkills(currentSkills);

      // Update Volunteer Data including Email
      const { error: updateError } = await supabase
        .from("volunteers")
        .update({
          interest: description,
          location: location,
          availability: availability,
          email: email,
          ai_skills: currentSkills,
        })
        .eq("user_id", session.user.id);

      if (updateError) throw updateError;

      // Pass the skills explicitly to the fetch function
      await fetchOpportunities(location, currentSkills);
    } catch (error) {
      console.error("Error updating preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  // FIX: Logic to handle skills filtering properly
  const fetchOpportunities = async (searchLocation, activeSkills = []) => {
    try {
      let query = supabase
        .from("ngos")
        .select("*")
        .order("created_at", { ascending: false });

      // FIX: Added backticks for template literal
      if (searchLocation && searchLocation.trim() !== "") {
        query = query.ilike("location", `%${searchLocation}%`);
      }

      const { data: allPosts, error } = await query;
      if (error) throw error;

      let finalPosts = allPosts || [];

      // STRICT FILTERING: Only show posts that match at least one skill
      if (activeSkills.length > 0) {
        finalPosts = finalPosts.filter((post) => {
          let ngoNeeds = post.ai_needs;

          // Handle JSON or string format of skills
          if (typeof ngoNeeds === "string") {
            try {
              ngoNeeds = JSON.parse(ngoNeeds);
            } catch (e) {
              ngoNeeds = [];
            }
          }
          if (!Array.isArray(ngoNeeds)) ngoNeeds = [];

          // Case-insensitive comparison
          const hasMatch = ngoNeeds.some((need) =>
            activeSkills.some(
              (skill) => skill.toLowerCase() === need.toLowerCase()
            )
          );
          return hasMatch;
        });
      }

      setOpportunities(finalPosts);
    } catch (error) {
      console.error("Error fetching opportunities:", error);
    }
  };

  // --- 5. HANDLE APPLY ---
  const handleApply = async (post) => {
    // FIX: Added backticks for template literals
    if (post.email) {
      const subject = encodeURIComponent(
        `Volunteer Application: ${post.org_name}`
      );
      const body = encodeURIComponent(
        `Hello,\n\nI am interested in applying for your post regarding: "${post.raw_requirement}".\n\n` +
          `My Name: ${fullName}\n` +
          `My Email: ${email || session.user.email}\n` +
          `My Contact: ${contactNo}\n\n` +
          `Experience: ${experience}\n\n` +
          `Looking forward to hearing from you.`
      );

      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${post.email}&su=${subject}&body=${body}`;
      window.open(gmailUrl, "_blank");
    } else {
      alert(
        "Application Recorded.\n\nNote: This specific NGO post does not have an email address saved."
      );
    }

    setAppliedPostIds([...appliedPostIds, post.id]);

    try {
      const { error } = await supabase.from("applications").insert([
        {
          ngo_post_id: post.id,
          volunteer_id: session.user.id,
          status: "pending",
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error("Apply Error:", error);
    }
  };

  if (checkingProfile)
    return (
      <div className="flex h-screen items-center justify-center text-teal-600">
        Loading...
      </div>
    );

  // ================= VIEW 1: IDENTITY FORM =================
  if (!profileComplete) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 pb-20 pt-32">
          <div className="rounded-[2rem] border border-teal-100 bg-white p-10 shadow-xl">
            <h1 className="mb-2 text-center text-3xl font-extrabold text-gray-900">
              Complete Your Profile
            </h1>
            <p className="mb-8 text-center text-gray-500">
              Tell us a bit about yourself to get started.
            </p>

            <form onSubmit={handleCreateProfile} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
                    Full Name
                  </label>
                  {/* FIX: Corrected className syntax with quotes */}
                  <input
                    type="text"
                    className="w-full rounded-xl border bg-gray-50 p-3 outline-none focus:ring-2 focus:ring-teal-500/20"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
                    Contact Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    className="w-full rounded-xl border bg-gray-50 p-3 outline-none focus:ring-2 focus:ring-teal-500/20"
                    value={contactNo}
                    onChange={handleContactChange}
                    required
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
                  Experience (Duration)
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border bg-gray-50 p-3 outline-none focus:ring-2 focus:ring-teal-500/20"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  required
                  placeholder="e.g. 1 Year"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
                  Upload Resume (PDF)
                </label>
                <div className="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-200 p-4 text-center hover:bg-gray-50">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                  <span className="text-sm text-gray-500">
                    {resumeFile ? resumeFile.name : "Click to select file"}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#319795] to-teal-600 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {uploading ? "Saving..." : "Save & Continue to Dashboard"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ================= VIEW 2: DASHBOARD =================
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Navbar />

      <div className="mx-auto max-w-7xl px-3 pb-20 pt-28 sm:px-6">
        {/* HERO */}
        <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-gray-100 bg-white px-8 py-10 shadow-sm">
          <div className="relative z-10">
            <h1 className="mb-2 text-2xl font-extrabold text-gray-900 sm:text-3xl md:text-4xl">
              Volunteer <span className="text-teal-600">Dashboard</span>
            </h1>
            <p className="text-gray-500">
              Welcome, {fullName}. Describe your skills below to find matches.
            </p>
          </div>
        </div>

        {/* INPUTS */}
        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg sm:p-8">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Your Volunteering Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
                  <FaPencilAlt className="mr-1 inline" /> How do you want to
                  help?
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. I am good at photography and I can also teach math to kids..."
                  className="min-h-[120px] w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none focus:ring-2 focus:ring-teal-500/20 sm:h-32"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
                    <FaClock className="mr-1 inline" /> Availability
                  </label>
                  <input
                    type="text"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none"
                    placeholder="e.g. 2 Months"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
                    <FaMapMarkerAlt className="mr-1 inline" /> Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none"
                    placeholder="e.g. Pune"
                  />
                </div>
              </div>

              {/* --- NEW EMAIL INPUT --- */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase text-gray-500">
                  <FaEnvelope className="mr-1 inline" /> Your Email (For
                  Applications)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none"
                  placeholder="your-email@example.com"
                />
              </div>

              <button
                onClick={handleFindOpportunities}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 !rounded-full bg-gradient-to-r from-[#319795] to-teal-600 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Analyzing & Matching..." : "Find Opportunities"}
              </button>
            </div>
          </div>

          {/* AI SKILLS BOX */}
          <div className="flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-lg sm:p-8">
            <h2 className="mb-2 text-xl font-bold text-gray-900">
              AI-Identified Skills
            </h2>
            <p className="mb-6 text-sm text-gray-400">
              We will match you based on these tags.
            </p>

            <div className="flex-1 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-6">
              {detectedSkills.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <FaRobot className="mb-3 text-4xl opacity-20" />
                  <span className="text-sm font-medium">
                    Type your description to generate tags
                  </span>
                </div>
              ) : (
                <div className="flex flex-wrap content-start gap-3">
                  {detectedSkills.map((skill, i) => (
                    <span
                      key={i}
                      className="animate-fade-in-up rounded-lg border border-teal-100 bg-white px-4 py-2 text-sm font-bold text-teal-700 shadow-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {interviews.length > 0 && (
          <div className="mb-10 rounded-[2rem] border border-teal-100 bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Upcoming Interviews
            </h2>

            <div className="space-y-4">
              {interviews.map((interview) => (
                <div
                  key={interview.id}
                  className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {interview.ngos?.org_name}
                    </p>
                    <p className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaCalendarAlt className="text-teal-500" />
                        {interview.interview_date}
                      </span>

                      <span className="flex items-center gap-1">
                        <FaClock className="text-teal-500" />
                        {interview.interview_time}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {/* JOIN MEET */}
                    <a
                      href={interview.meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full bg-teal-600 px-5 py-2 text-sm font-bold text-white !no-underline shadow hover:bg-teal-700"
                    >
                      Join Now
                    </a>

                    {/* ADD TO CALENDAR */}
                    <a
                      href={generateGoogleCalendarLink(interview)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-teal-600 px-5 py-2 text-sm font-bold text-teal-600 !no-underline hover:bg-teal-50"
                    >
                      Add to Calendar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEED SECTION */}
        <div>
          <h3 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-900">
            <FaBuilding className="text-teal-500" />
            {detectedSkills.length > 0
              ? "Strict Skill Matches"
              : "Recent Opportunities"}
            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-normal text-gray-500">
              {opportunities.length} found
            </span>
          </h3>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.length > 0 ? (
              opportunities.map((post) => {
                const isApplied = appliedPostIds.includes(post.id);

                return (
                  <div
                    key={post.id}
                    className="flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-xl font-bold uppercase text-teal-600">
                        {post.org_name ? post.org_name.charAt(0) : "N"}
                      </div>
                      <span className="rounded-md bg-gray-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="mb-1 text-lg font-bold text-gray-900">
                      {post.org_name || "Unknown Organization"}
                    </h4>

                    <div className="mb-3 flex items-center gap-2 text-xs font-medium text-gray-500">
                      <span className="flex items-center gap-1">
                        <FaMapMarkerAlt /> {post.location}
                      </span>
                      <span className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-gray-600">
                        <FaClock /> {post.duration || "Flexible"}
                      </span>
                    </div>

                    {/* Show Skills Needed by NGO */}
                    <div className="mb-4 flex flex-wrap gap-1">
                      {post.ai_needs &&
                        (typeof post.ai_needs === "string"
                          ? JSON.parse(post.ai_needs)
                          : post.ai_needs
                        ).map((skill, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] px-2 py-1 rounded border ${
                              detectedSkills.includes(skill)
                                ? "bg-teal-100 text-teal-800 border-teal-200 font-bold"
                                : "bg-gray-50 text-gray-500 border-gray-100"
                            }`}
                          >
                            {skill}
                          </span>
                        ))}
                    </div>

                    <p className="mb-4 line-clamp-2 flex-grow text-sm text-gray-600">
                      "{post.raw_requirement}"
                    </p>

                    {/* APPLY BUTTON (Dynamic) */}
                    <button
                      onClick={() => handleApply(post)}
                      disabled={isApplied}
                      className={` w-full py-2.5 sm:py-3 text-sm sm:text-base !rounded-full bg-gradient-to-r from-[#319795] to-teal-600 text-white font-bold text-base shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2
                            ${
                              isApplied
                                ? "bg-green-100 text-green-700 cursor-default border border-green-200"
                                : "bg-gray-900 text-white hover:opacity-90 shadow-md"
                            }`}
                    >
                      {isApplied ? (
                        <>
                          <FaCheck /> Applied
                        </>
                      ) : (
                        "Apply Now"
                      )}
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full rounded-3xl border border-dashed bg-white py-12 text-center text-gray-400">
                {detectedSkills.length > 0
                  ? "No NGOs match your specific skills yet."
                  : "Enter your skills above to find matches."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
