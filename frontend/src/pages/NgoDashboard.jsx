import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import axios from "axios";
import {
  FaRobot,
  FaMapMarkerAlt,
  FaSearch,
  FaPlus,
  FaSave,
  FaBuilding,
  FaPhone,
  FaHistory,
  FaUser,
  FaEnvelope,
  FaTrashAlt,
  FaHandHoldingHeart,
  FaTimes,
  FaInfoCircle,
  FaFileUpload,
  FaFilePdf,
  FaEye,
  FaTrash,
  FaEdit,
} from "react-icons/fa";

// --- API HELPER ---
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

const fetchAiSkills = async (text) => {
  if (!text) return ["General Volunteering"];
  try {
    const response = await axios.post(`${API_URL}/ai/analyze`, {
      text: text,
      type: "skills",
    });
    const skills = response.data.skills;
    return skills && skills.length > 0 ? skills : ["General Volunteering"];
  } catch (error) {
    console.error("AI Fetch Error", error);
    return ["General Volunteering"];
  }
};

const extractMetadata = (text) => {
  if (!text) return { duration: "Flexible" };
  const lower = text.toLowerCase();
  let duration = "Flexible";
  const timePatterns = [
    /(\d+)\s*months?/,
    /(\d+)\s*weeks?/,
    /(\d+)\s*days?/,
    /(\d+)\s*hours?/,
  ];
  for (const pattern of timePatterns) {
    const match = lower.match(pattern);
    if (match) {
      duration = match[0];
      break;
    }
  }
  return { duration };
};

export default function NgoDashboard() {
  const { session } = useAuth();

  // Input State
  const [orgName, setOrgName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);

  // --- SCHEMES STATE ---
  const [schemes, setSchemes] = useState([]);
  const [currentScheme, setCurrentScheme] = useState({ name: "", desc: "" });
  const [schemeFile, setSchemeFile] = useState(null);
  const [showSchemeModal, setShowSchemeModal] = useState(false);
  const [uploadingScheme, setUploadingScheme] = useState(false);

  // App State
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [myPosts, setMyPosts] = useState([]);

  // Interview Scheduling
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [meetLink, setMeetLink] = useState("");

  // --- INITIALIZATION ---
  useEffect(() => {
    if (session?.user) {
      fetchMyPosts();
      loadInitialSchemes();
    }
  }, [session]);

  useEffect(() => {
    if (schemes.length > 0) {
      localStorage.setItem(
        `ngo_schemes_${session?.user?.id}`,
        JSON.stringify(schemes)
      );
    }
  }, [schemes, session]);

  const loadInitialSchemes = async () => {
    const localSchemes = localStorage.getItem(
      `ngo_schemes_${session?.user?.id}`
    );
    if (localSchemes) {
      try {
        setSchemes(JSON.parse(localSchemes));
        return;
      } catch (e) {
        console.error("Error parsing local schemes", e);
      }
    }
    await fetchLatestSchemesFromDB();
  };

  const fetchLatestSchemesFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from("ngos")
        .select("schemes")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && data.schemes && Array.isArray(data.schemes)) {
        setSchemes(data.schemes);
        localStorage.setItem(
          `ngo_schemes_${session?.user?.id}`,
          JSON.stringify(data.schemes)
        );
      }
    } catch (error) {
      console.error("Error loading saved schemes:", error);
    }
  };

  const fetchMyPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("ngos")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMyPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchApplicationsForPost = async (postId) => {
    try {
      const { data, error } = await supabase
        .from("applications")
        .select(
          `id, interview_status, interview_date, interview_time, meet_link, volunteer_id, volunteers!applications_volunteer_id_fkey (full_name, email)`
        )
        .eq("ngo_post_id", postId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error.message);
    }
  };

  const handleContactChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      if (value.length <= 10) setContact(value);
    }
  };

  const handleAddScheme = async () => {
    if (!currentScheme.name.trim()) return alert("Scheme Name is required");
    if (!currentScheme.desc.trim())
      return alert("Scheme Description is required");

    let pdfUrl = null;

    if (schemeFile) {
      setUploadingScheme(true);
      try {
        const fileExt = schemeFile.name.split(".").pop();
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("scheme-docs")
          .upload(fileName, schemeFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("scheme-docs")
          .getPublicUrl(fileName);

        pdfUrl = urlData.publicUrl;
      } catch (error) {
        alert("Error uploading PDF: " + error.message);
        setUploadingScheme(false);
        return;
      }
      setUploadingScheme(false);
    }

    const newSchemes = [
      ...schemes,
      { ...currentScheme, id: Date.now(), pdf_url: pdfUrl },
    ];
    setSchemes(newSchemes);
    setCurrentScheme({ name: "", desc: "" });
    setSchemeFile(null);
    setShowSchemeModal(false);
  };

  const handleRemoveScheme = (id) => {
    if (
      !window.confirm(
        "Delete this scheme? It will be removed from your active list."
      )
    )
      return;

    const newSchemes = schemes.filter((s) => s.id !== id);
    setSchemes(newSchemes);

    if (newSchemes.length === 0) {
      localStorage.removeItem(`ngo_schemes_${session?.user?.id}`);
    } else {
      localStorage.setItem(
        `ngo_schemes_${session?.user?.id}`,
        JSON.stringify(newSchemes)
      );
    }
  };

  const handlePost = async () => {
    if (!description || !location || !orgName || !contact || !email) {
      return alert("Please fill all fields (including Email) to post.");
    }
    if (contact.length !== 10)
      return alert("Contact number must be exactly 10 digits.");

    setLoading(true);
    try {
      if (session?.user) {
        const skills = await fetchAiSkills(description);
        const { duration } = extractMetadata(description);

        const { error } = await supabase.from("ngos").insert([
          {
            user_id: session.user.id,
            org_name: orgName,
            contact_info: contact,
            email: email,
            ai_needs: skills,
            raw_requirement: description,
            location: location,
            duration: duration,
            schemes: schemes,
          },
        ]);

        if (error) throw error;

        fetchMyPosts();
        alert("Requirement Posted Successfully!");
        resetForm();
      }
    } catch (error) {
      alert("Error posting: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- UPDATED MATCHING LOGIC ---
  const handleFindMatch = async (e) => {
    e.preventDefault();
    if (!description || !location)
      return alert("Please provide Description and Location.");

    setLoading(true);
    setAiResult(null);

    try {
      const detectedSkills = await fetchAiSkills(description);

      const { data: volunteers, error } = await supabase
        .from("volunteers")
        .select("*")
        .ilike("location", `%${location}%`);

      if (error) throw error;

      const matches = volunteers
        .map((vol) => {
          let volSkills = vol.ai_skills || [];
          if (typeof volSkills === "string") {
            try {
              volSkills = JSON.parse(volSkills);
            } catch (e) {
              volSkills = [];
            }
          }
          if (!Array.isArray(volSkills)) volSkills = [];

          // --- FIX 1: BI-DIRECTIONAL MATCHING ---
          // This ensures that if Need="Dancing" and Skill="Dance", it matches.
          // OR if Need="Singing and Dancing" and Skill="Dancing", it matches.
          const overlap = volSkills.filter((skill) =>
            detectedSkills.some(
              (need) =>
                skill.toLowerCase().includes(need.toLowerCase()) ||
                need.toLowerCase().includes(skill.toLowerCase())
            )
          );

          if (overlap.length > 0) {
            // --- FIX 2: DYNAMIC SCORING ---
            // Score calculates percentage of needs met + base score
            const matchRatio =
              overlap.length / Math.max(detectedSkills.length, 1);
            const score = Math.min(Math.round(60 + matchRatio * 40), 99);

            return {
              ...vol,
              score: score,
              matchedSkills: overlap,
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);

      setAiResult({ skills: detectedSkills, matches });
    } catch (error) {
      console.error("Matching Error:", error);
      alert("Something went wrong finding matches.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, postId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const { error: appError } = await supabase
        .from("applications")
        .delete()
        .eq("ngo_post_id", postId);
      if (appError) throw appError;
      const { error } = await supabase.from("ngos").delete().eq("id", postId);
      if (error) throw error;
      setMyPosts(myPosts.filter((post) => post.id !== postId));
      if (selectedPostId === postId) resetForm();
    } catch (error) {
      alert("Error deleting post: " + error.message);
    }
  };

  const loadFromHistory = (post) => {
    setSelectedPostId(post.id);
    setOrgName(post.org_name || "");
    setContact(post.contact_info || "");
    setEmail(post.email || "");
    setDescription(post.raw_requirement);
    setLocation(post.location);
    setAiResult(null);
    fetchApplicationsForPost(post.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleScheduleInterview = async () => {
    if (!interviewDate || !interviewTime || !meetLink)
      return alert("Please fill all interview details");
    try {
      const { error } = await supabase
        .from("applications")
        .update({
          interview_date: interviewDate,
          interview_time: interviewTime,
          meet_link: meetLink,
          interview_status: "scheduled",
        })
        .eq("id", selectedApplication.id);
      if (error) throw error;
      alert("Interview Scheduled!");
      await fetchApplicationsForPost(selectedPostId);
      setSelectedApplication(null);
      setInterviewDate("");
      setInterviewTime("");
      setMeetLink("");
    } catch (error) {
      alert("Error scheduling interview: " + error.message);
    }
  };

  const resetForm = () => {
    setSelectedPostId(null);
    setOrgName("");
    setContact("");
    setEmail("");
    setDescription("");
    setLocation("");
    setAiResult(null);
  };

  const handleCancelInterview = async (applicationId) => {
    if (!window.confirm("Cancel this interview?")) return;
    try {
      const { error } = await supabase
        .from("applications")
        .update({
          interview_date: null,
          interview_time: null,
          meet_link: null,
          interview_status: "pending",
        })
        .eq("id", applicationId);
      if (error) throw error;
      fetchApplicationsForPost(selectedPostId);
    } catch (error) {
      alert("Error cancelling interview: " + error.message);
    }
  };

  const openRescheduleModal = (application) => {
    setSelectedApplication(application);
    setInterviewDate(application.interview_date || "");
    setInterviewTime(application.interview_time || "");
    setMeetLink(application.meet_link || "");
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gray-50 font-sans text-gray-900">
      <Navbar />
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 lg:pt-28">
        {/* HEADER */}
        <div className="relative mb-8 flex flex-col justify-between gap-6 overflow-hidden rounded-[2rem] border border-gray-100 bg-white px-8 py-10 shadow-sm md:flex-row md:items-center">
          <div className="relative z-10">
            <h1 className="mb-2 text-4xl font-extrabold text-gray-900">
              NGO <span className="text-teal-600">Dashboard</span>
            </h1>
            <p className="text-gray-500">
              Post requirements and manage your social schemes.
            </p>
          </div>

          <button
            onClick={() => setShowSchemeModal(true)}
            className="flex w-full items-center justify-center gap-2 !rounded-full border !border-teal-100 !bg-teal-700 px-6 py-3 text-sm font-bold !text-teal-50 shadow-sm transition-transform hover:scale-105 hover:bg-teal-800 md:w-auto"
          >
            <FaHandHoldingHeart className="text-lg" />
            Add New Scheme
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* LEFT: FORM */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:col-span-5">
            <div
              className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border relative overflow-hidden transition-all duration-300 ${
                selectedPostId
                  ? "border-teal-400 ring-4 ring-teal-50"
                  : "border-white/50 ring-1 ring-gray-200/50"
              }`}
            >
              {selectedPostId && (
                <div className="-mx-6 -mt-6 mb-4 flex items-center justify-between border-b border-teal-100 !bg-teal-50 px-4 py-2 !text-teal-700">
                  <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                    <FaHistory /> Viewing Past Post
                  </span>
                  <button
                    onClick={resetForm}
                    className="flex items-center gap-1 !rounded-full !bg-teal-700 text-xs font-bold text-white no-underline hover:text-teal-900"
                  >
                    <FaPlus /> Create New
                  </button>
                </div>
              )}

              <h2 className="mb-5 flex items-center gap-3 text-lg font-bold text-gray-800">
                <div
                  className={`p-2 rounded-xl text-xl ${
                    selectedPostId
                      ? "bg-teal-100 text-teal-600"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <FaRobot />
                </div>
                <span>AI Requirement Scanner</span>
              </h2>

              <form
                onSubmit={handleFindMatch}
                className="relative z-10 space-y-4"
              >
                <div>
                  <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Organization Name
                  </label>
                  <div className="flex w-full items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:border-[#319795] focus-within:ring-2 focus-within:ring-teal-500/10">
                    <div className="shrink-0 pl-4 pr-2 text-lg text-teal-500">
                      <FaBuilding />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g. Hope Foundation"
                      className="w-full border-none bg-transparent py-3 pr-4 text-sm font-medium text-gray-700 outline-none"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Describe your Need
                  </label>
                  <textarea
                    placeholder="e.g. We need a math teacher..."
                    className="h-28 w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium text-gray-700 outline-none transition-all focus:border-[#319795] focus:ring-2 focus:ring-teal-500/10"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                      Location
                    </label>
                    <div className="flex w-full items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:border-[#319795] focus-within:ring-2 focus-within:ring-teal-500/10">
                      <div className="shrink-0 pl-4 pr-2 text-lg text-teal-500">
                        <FaMapMarkerAlt />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. Pune"
                        className="w-full border-none bg-transparent py-3 pr-4 text-sm font-medium text-gray-700 outline-none"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                      Contact No.
                    </label>
                    <div className="flex w-full items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:border-[#319795] focus-within:ring-2 focus-within:ring-teal-500/10">
                      <div className="shrink-0 pl-4 pr-2 text-lg text-teal-500">
                        <FaPhone />
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. 9876543210"
                        className="w-full border-none bg-transparent py-3 pr-4 text-sm font-medium text-gray-700 outline-none"
                        value={contact}
                        onChange={handleContactChange}
                        maxLength={10}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 ml-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                    Email Address
                  </label>
                  <div className="flex w-full items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50 focus-within:border-[#319795] focus-within:ring-2 focus-within:ring-teal-500/10">
                    <div className="shrink-0 pl-4 pr-2 text-lg text-teal-500">
                      <FaEnvelope />
                    </div>
                    <input
                      type="email"
                      placeholder="ngo@example.com"
                      className="w-full border-none bg-transparent py-3 pr-4 text-sm font-medium text-gray-700 outline-none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {schemes.length > 0 && (
                  <div className="flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 p-3 text-xs text-teal-700">
                    <FaHandHoldingHeart />
                    <span className="font-semibold">
                      {schemes.length} Scheme(s) Attached
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSchemeModal(true)}
                      className="!hover:text-teal-900 ml-auto flex items-center gap-1 !rounded-full bg-white font-bold text-teal-900 underline"
                    >
                      <FaEdit /> Edit List
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full !rounded-full bg-gradient-to-r from-[#319795] to-teal-600 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.01] disabled:opacity-70"
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      <>
                        <FaSearch className="mr-2 inline" /> Find Match
                      </>
                    )}
                  </button>
                  {!selectedPostId && (
                    <button
                      type="button"
                      onClick={handlePost}
                      disabled={loading}
                      className="w-full !rounded-full bg-gradient-to-r from-[#319795] to-teal-600 py-3 text-base font-bold text-white shadow-lg transition-all hover:scale-[1.01] disabled:opacity-70"
                    >
                      <FaSave className="mr-2 inline" /> Post Requirement
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* RECENT POSTS */}
            <div className="w-full rounded-3xl border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
              <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-700">
                <FaHistory className="text-teal-500" /> Recent Posts
              </h3>
              {myPosts.length === 0 ? (
                <div className="py-6 text-center text-xs text-gray-400">
                  No history yet.
                </div>
              ) : (
                <div className="custom-scrollbar max-h-64 space-y-3 overflow-y-auto pr-2">
                  {myPosts.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => loadFromHistory(post)}
                      className={`relative !rounded-xl border !bg-gray-50 p-4 cursor-pointer transition-all ${
                        selectedPostId === post.id
                          ? "!border-teal-400 !bg-teal-50"
                          : "hover:border-teal-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800">
                            {post.org_name}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(e, post.id);
                          }}
                          className="!hover:bg-red-50 !hover:text-red-700 absolute right-3 top-3 !rounded-full !bg-white p-2 !text-red-500"
                          title="Delete post"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                      <div className="mt-1 space-y-1">
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                          {post.raw_requirement}
                        </p>
                        {post.schemes && post.schemes.length > 0 && (
                          <div className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-1.5 py-0.5 text-[9px] text-teal-600">
                            <FaHandHoldingHeart /> {post.schemes.length}{" "}
                            Scheme(s)
                          </div>
                        )}
                        <p className="mt-1 text-xs text-gray-400">
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* APPLIED VOLUNTEERS */}
            {selectedPostId && (
              <div className="w-full rounded-[2rem] border border-gray-100 bg-white p-4 shadow-lg sm:p-6">
                <h3 className="mb-4 text-lg font-bold text-gray-800">
                  Applied Volunteers
                </h3>

                {applications.length === 0 ? (
                  <p className="text-sm text-gray-400">No applications yet.</p>
                ) : (
                  <div className="space-y-3">
                    {applications.map((app) => (
                      <div
                        key={app.id}
                        className="relative rounded-xl border bg-gray-50 p-4"
                      >
                        <button
                          onClick={() => handleCancelInterview(app.id)}
                          className="!hover:bg-red-50 absolute right-3 top-3 !rounded-full !bg-white p-2 text-red-500 hover:text-red-700"
                          title="Cancel Interview"
                        >
                          <FaTrashAlt />
                        </button>

                        <div className="space-y-2">
                          <p className="font-bold text-gray-800">
                            {app.volunteers?.full_name || "Volunteer"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Status: {app.interview_status}
                          </p>
                        </div>

                        {app.interview_status === "scheduled" ? (
                          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                            <a
                              href={app.meet_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded-full bg-teal-600 px-5 py-2.5 text-xs font-bold !text-white !no-underline shadow-sm hover:bg-teal-700"
                            >
                              Join Meet
                            </a>

                            <button
                              onClick={() => openRescheduleModal(app)}
                              className="inline-flex items-center justify-center !rounded-full !bg-gray-900 px-5 py-2 text-xs font-bold !text-white shadow-sm hover:bg-gray-800"
                            >
                              Reschedule
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4">
                            <button
                              onClick={() => setSelectedApplication(app)}
                              className="w-full !rounded-full !bg-gray-900 px-4 py-2 text-xs font-bold !text-white"
                            >
                              Schedule
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: CONTENT & SCHEMES */}
          <div className="pb-10 lg:col-span-7">
            {/* IDLE STATE: SHOW READY TO MATCH & SCHEMES LIST */}
            {!aiResult && !loading && !selectedPostId && (
              <div className="flex flex-col gap-6">
                {/* 1. Ready to Match Banner */}
                <div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-gray-200 bg-white/60 p-8 text-center backdrop-blur-sm">
                  <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-300">
                    <FaSearch className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-400">
                    Ready to Match
                  </h3>
                  <p className="mt-1 text-xs text-gray-400">
                    Fill the form to find volunteers
                  </p>
                </div>

                {/* 2. Active Schemes Display (Card Grid with Actions) */}
                <div>
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
                    <FaHandHoldingHeart className="text-teal-600" />
                    Your Active Schemes
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      {schemes.length}
                    </span>
                  </h3>

                  {schemes.length === 0 ? (
                    <div className="!rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-400 shadow-sm">
                      <div className="mb-2 flex justify-center text-2xl text-gray-300">
                        <FaInfoCircle />
                      </div>
                      You haven't added any social schemes yet. <br />
                      Click <strong>"Add New Scheme"</strong> (top right) to add
                      one.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      {schemes.map((s, i) => (
                        <div
                          key={s.id || i}
                          className="flex flex-col justify-between rounded-2xl border border-teal-50 !bg-white p-3 shadow-sm transition-all hover:border-teal-200 hover:shadow-md"
                        >
                          <div>
                            <h4
                              className="mb-2 line-clamp-1 text-sm font-bold text-gray-900"
                              title={s.name}
                            >
                              {s.name}
                            </h4>
                            <p
                              className="line-clamp-1 text-xs leading-relaxed text-gray-500"
                              title={s.desc}
                            >
                              {s.desc}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-gray-50">
                            <div className="flex gap-2">
                              {s.pdf_url && (
                                <a
                                  href={s.pdf_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 !rounded-full !bg-teal-50 px-2 py-2 text-[10px] font-bold !text-teal-700 transition-colors hover:bg-teal-100"
                                  title="View PDF"
                                >
                                  <FaEye /> View PDF
                                </a>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveScheme(s.id)}
                              className="!hover:text-red-500 !rounded-full !bg-white p-2 !text-red-600 transition-colors hover:text-red-600"
                              title="Delete Scheme"
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI RESULTS */}
            {aiResult && (
              <div className="animate-fade-in-up space-y-6">
                <div className="rounded-[2rem] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-teal-50/30 p-6 shadow-sm">
                  <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-800">
                    <FaRobot className="text-lg" /> AI Detected Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-xl border border-teal-100 bg-white px-4 py-2 text-xs font-bold text-teal-800 shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="flex items-center gap-3 text-xl font-bold text-gray-900">
                  Matches Found{" "}
                  <span className="rounded-full bg-gray-900 px-2.5 py-1 text-xs text-teal-400 shadow-md">
                    {aiResult.matches.length}
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {aiResult.matches.map((vol) => (
                    <div
                      key={vol.id}
                      className="group rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-lg"
                    >
                      <div className="flex justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 font-black uppercase text-gray-500">
                            {vol.full_name ? (
                              vol.full_name.charAt(0)
                            ) : (
                              <FaUser />
                            )}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-gray-900">
                              {vol.full_name || "Volunteer"}
                            </h4>
                            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                              <FaMapMarkerAlt className="text-teal-500" />{" "}
                              {vol.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-black text-gray-900">
                            {vol.score}
                            <span className="text-base text-teal-500">%</span>
                          </div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            Match Score
                          </div>
                        </div>
                      </div>
                      {vol.resume_url && (
                        <div className="mt-4 border-t border-gray-100 pt-3">
                          <a
                            href={vol.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-50 py-2.5 text-xs font-bold text-teal-700 transition-colors hover:bg-teal-100"
                          >
                            <FaFilePdf className="text-sm" /> View Resume
                          </a>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* INTERVIEW MODAL */}
            {selectedApplication && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                  <h3 className="text-lg font-bold">Schedule Interview</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">
                        Interview Date
                      </label>
                      <input
                        type="date"
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">
                        Interview Time
                      </label>
                      <input
                        type="time"
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/30"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-500">
                        Google Meet Link
                      </label>
                      <input
                        type="text"
                        placeholder="https://meet.google.com/xxx"
                        value={meetLink}
                        onChange={(e) => setMeetLink(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/30"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-3">
                    <button
                      onClick={() => setSelectedApplication(null)}
                      className="!rounded-full !border px-4 py-2 text-sm text-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleScheduleInterview}
                      className="!rounded-full !bg-teal-600 px-4 py-2 text-sm font-bold text-white"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL: ADD NEW SCHEME ONLY --- */}
      {showSchemeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="animate-fade-in-up flex w-full max-w-md flex-col rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h3 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <FaHandHoldingHeart className="text-teal-600" /> Add New Scheme
              </h3>
              <button
                onClick={() => setShowSchemeModal(false)}
                className="!hover:bg-gray-200 !rounded-full !bg-gray-100 p-2 !text-gray-500"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider !text-gray-500">
                  Scheme Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Clean City Initiative"
                  className="w-full !rounded-xl border !border-gray-200 !bg-gray-50 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  value={currentScheme.name}
                  onChange={(e) =>
                    setCurrentScheme({ ...currentScheme, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider !text-gray-500">
                  Description
                </label>
                <textarea
                  placeholder="Short description..."
                  rows="3"
                  className="w-full resize-none rounded-xl border !border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  value={currentScheme.desc}
                  onChange={(e) =>
                    setCurrentScheme({ ...currentScheme, desc: e.target.value })
                  }
                />
              </div>

              {/* PDF UPLOAD INPUT */}
              <div className="space-y-1">
                <label className="items-center text-xs font-bold uppercase tracking-wider text-gray-500">
                  Upload Brochure/PDF (Optional)
                </label>
                <div className="relative w-full">
                  <label className="flex w-full cursor-pointer !items-center !justify-center gap-2 !rounded-xl border-2 border-dashed !border-gray-200 bg-gray-50 px-4 py-4 text-sm font-medium text-gray-500 hover:bg-gray-100">
                    <FaFileUpload className="text-lg text-teal-500" />
                    <span>
                      {schemeFile ? schemeFile.name : "Click to attach PDF"}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => setSchemeFile(e.target.files[0])}
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddScheme}
                disabled={uploadingScheme}
                className="mt-2 flex w-full items-center justify-center gap-2 !rounded-full !bg-teal-600 py-3.5 text-sm font-bold !text-white shadow-md hover:bg-teal-700 disabled:opacity-70"
              >
                {uploadingScheme ? (
                  "Uploading..."
                ) : (
                  <>
                    <FaPlus /> Add Scheme
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
