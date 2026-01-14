import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import {
  FaRobot, FaMapMarkerAlt, FaSearch, FaClock, FaPencilAlt,
  FaBuilding, FaCheckCircle, FaUser, FaFileUpload, FaPhoneAlt, FaBriefcase
} from "react-icons/fa";

// --- 1. AI SKILL DETECTION LOGIC ---
const getDetectedSkills = (text) => {
    if (!text) return [];
    const lowerText = text.toLowerCase();
    let skills = [];

    // Education
    if (lowerText.includes("teach") || lowerText.includes("tutor")) skills.push("Teaching");
    if (lowerText.includes("math")) skills.push("Math");
    if (lowerText.includes("science")) skills.push("Science");
    if (lowerText.includes("kid") || lowerText.includes("child")) skills.push("Childcare");
   
    // Arts & Culture
    if (lowerText.includes("dance") || lowerText.includes("dancing")) skills.push("Dancing");
    if (lowerText.includes("sing") || lowerText.includes("music") || lowerText.includes("song")) skills.push("Singing/Music");
    if (lowerText.includes("paint") || lowerText.includes("draw") || lowerText.includes("art")) skills.push("Art");

    // Tech & Media
    if (lowerText.includes("photo") || lowerText.includes("camera")) skills.push("Photography");
    if (lowerText.includes("video") || lowerText.includes("edit")) skills.push("Video Editing");
    if (lowerText.includes("web") || lowerText.includes("code") || lowerText.includes("react")) skills.push("Web Development");
   
    // Logistics
    if (lowerText.includes("drive") || lowerText.includes("car")) skills.push("Driving");
    if (lowerText.includes("food") || lowerText.includes("cook")) skills.push("Cooking");

    return [...new Set(skills)]; // Remove duplicates
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
  const [availability, setAvailability] = useState(""); // Changed to empty string for text input
  const [location, setLocation] = useState("");
 
  const [detectedSkills, setDetectedSkills] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- 1. CHECK PROFILE ON LOAD ---
  useEffect(() => {
    if (session?.user) {
      checkProfile();
    }
  }, [session]);

  const checkProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (data && data.full_name && data.contact_no) {
        setProfileComplete(true);
        setFullName(data.full_name);
       
        // Load saved preferences if they exist
        if (data.interest) setDescription(data.interest);
        if (data.location) setLocation(data.location);
        if (data.availability) setAvailability(data.availability);
       
        // Trigger initial search if data exists
        if (data.interest) {
            const skills = getDetectedSkills(data.interest);
            setDetectedSkills(skills);
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

  // --- HELPER: Handle Contact Input (Numbers Only) ---
  const handleContactChange = (e) => {
      const value = e.target.value;
      // Only allow numbers
      if (value === "" || /^[0-9\b]+$/.test(value)) {
          setContactNo(value);
      }
  };

  // --- 2. CREATE PROFILE (Identity Only) ---
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
        // Upload Resume
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
       
        const { error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(fileName, resumeFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(fileName);

        // Save Identity Info
        const { error: dbError } = await supabase
            .from('volunteers')
            .upsert({
                user_id: session.user.id,
                full_name: fullName,
                contact_no: contactNo,
                experience: experience,
                resume_url: publicUrl,
                location: "",
                interest: "",
                availability: "",
                ai_skills: []
            });

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


  // --- 4. FIND OPPORTUNITIES & SAVE PREFERENCES ---
  const handleFindOpportunities = async () => {
      if (!description) return alert("Please describe how you want to help first.");

      setLoading(true);
      try {
          // 1. Detect Skills
          const currentSkills = getDetectedSkills(description);
          setDetectedSkills(currentSkills);

          // 2. SAVE preferences to Database
          const { error: updateError } = await supabase
            .from('volunteers')
            .update({
                interest: description,
                location: location,
                availability: availability,
                ai_skills: currentSkills
            })
            .eq('user_id', session.user.id);

          if (updateError) throw updateError;

          // 3. FETCH & FILTER Opportunities
          await fetchOpportunities(location, currentSkills);

      } catch (error) {
          console.error("Error updating preferences:", error);
          alert("Something went wrong saving your preferences.");
      } finally {
          setLoading(false);
      }
  };

  const fetchOpportunities = async (searchLocation, activeSkills = []) => {
    try {
      let query = supabase
        .from('ngos')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchLocation && searchLocation.trim() !== "") {
        query = query.ilike('location', `%${searchLocation}%`);
      }

      const { data: allPosts, error } = await query;
      if (error) throw error;

      let finalPosts = allPosts || [];

      // STRICT FILTER BY SKILLS
      if (activeSkills.length > 0) {
          finalPosts = finalPosts.filter(post => {
             let ngoNeeds = post.ai_needs;
             if (typeof ngoNeeds === 'string') {
                 try { ngoNeeds = JSON.parse(ngoNeeds); } catch(e) { ngoNeeds = []; }
             }
             if (!Array.isArray(ngoNeeds)) ngoNeeds = [];

             const hasMatch = ngoNeeds.some(need =>
                 activeSkills.includes(need)
             );
             return hasMatch;
          });
      }

      setOpportunities(finalPosts);

    } catch (error) {
      console.error("Error fetching opportunities:", error);
    }
  };

  if (checkingProfile) return <div className="h-screen flex items-center justify-center text-teal-600">Loading...</div>;

  // ================= VIEW 1: IDENTITY FORM (SIMPLIFIED) =================
  if (!profileComplete) {
    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <div className="bg-white rounded-[2rem] shadow-xl border border-teal-100 p-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2 text-center">Complete Your Profile</h1>
                    <p className="text-center text-gray-500 mb-8">Tell us a bit about yourself to get started.</p>
                   
                    <form onSubmit={handleCreateProfile} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Full Name</label>
                                <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border outline-none focus:ring-2 focus:ring-teal-500/20" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="e.g. Name Surname" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contact Number</label>
                                {/* UPDATED: RESTRICTED TO 10 DIGITS */}
                                <input
                                    type="text"
                                    maxLength={10}
                                    className="w-full p-3 bg-gray-50 rounded-xl border outline-none focus:ring-2 focus:ring-teal-500/20"
                                    value={contactNo}
                                    onChange={handleContactChange}
                                    required
                                    placeholder="e.g. 9999999999"
                                />
                            </div>
                        </div>

                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Experience (Duration)</label>
                             <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border outline-none focus:ring-2 focus:ring-teal-500/20" value={experience} onChange={(e) => setExperience(e.target.value)} required placeholder="e.g. 1 Year" />
                        </div>
                       
                        <div>
                             <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Upload Resume (PDF)</label>
                             <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 relative">
                                <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                                <span className="text-sm text-gray-500">{resumeFile ? resumeFile.name : "Click to select file"}</span>
                             </div>
                        </div>

                        <button type="submit" disabled={uploading} className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#319795] to-teal-600 text-white font-bold text-base shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2
">
                            {uploading ? "Saving..." : "Save & Continue to Dashboard"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
  }

  // ================= VIEW 2: DASHBOARD (PREFERENCES & FEED) =================
  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
       
        {/* HERO */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
           <div className="relative z-10">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Volunteer <span className="text-teal-600">Dashboard</span></h1>
                <p className="text-gray-500">Welcome, {fullName}. Describe your skills below to find matches.</p>
           </div>
        </div>

        {/* INPUTS */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
           <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Your Volunteering Details</h2>
             
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-2 block"><FaPencilAlt className="inline mr-1"/> How do you want to help?</label>
                    <textarea
                       value={description}
                       onChange={(e) => setDescription(e.target.value)}
                       placeholder="e.g. I am good at photography and I can also teach math to kids..."
                       className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm h-32 resize-none focus:ring-2 focus:ring-teal-500/20"
                    ></textarea>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block"><FaClock className="inline mr-1"/> Availability</label>
                        {/* UPDATED: CHANGED FROM SELECT TO INPUT TEXT */}
                        <input
                           type="text"
                           value={availability}
                           onChange={(e) => setAvailability(e.target.value)}
                           className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
                           placeholder="e.g. 2 Months"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block"><FaMapMarkerAlt className="inline mr-1"/> Location</label>
                        <input
                           type="text"
                           value={location}
                           onChange={(e) => setLocation(e.target.value)}
                           className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
                           placeholder="e.g. Pune"
                        />
                    </div>
                 </div>

                 <button
                    onClick={handleFindOpportunities}
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#319795] to-teal-600 text-white font-bold text-base shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2
"
                 >
                    {loading ? "Analyzing & Matching..." : "Find Opportunities"}
                 </button>
              </div>
           </div>

           {/* AI SKILLS BOX */}
           <div className="bg-white p-8 rounded-[2rem] shadow-lg border border-gray-100 flex flex-col h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-2">AI-Identified Skills</h2>
              <p className="text-sm text-gray-400 mb-6">We will match you based on these tags.</p>
             
              <div className="flex-1 bg-gray-50 rounded-2xl p-6 border-2 border-dashed border-gray-200">
                 {detectedSkills.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                       <FaRobot className="text-4xl mb-3 opacity-20" />
                       <span className="text-sm font-medium">Type your description to generate tags</span>
                    </div>
                 ) : (
                    <div className="flex flex-wrap gap-3 content-start">
                       {detectedSkills.map((skill, i) => (
                          <span key={i} className="px-4 py-2 bg-white text-teal-700 font-bold text-sm rounded-lg shadow-sm border border-teal-100 animate-fade-in-up">
                             {skill}
                          </span>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* FEED SECTION */}
        <div>
           <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <FaBuilding className="text-teal-500" />
              {detectedSkills.length > 0 ? "Strict Skill Matches" : "Recent Opportunities"}
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                 {opportunities.length} found
              </span>
           </h3>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.length > 0 ? (
                 opportunities.map((post) => (
                    <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                       <div className="flex justify-between items-start mb-4">
                          <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xl uppercase">
                             {post.org_name ? post.org_name.charAt(0) : "N"}
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-2 py-1 rounded-md">
                             {new Date(post.created_at).toLocaleDateString()}
                          </span>
                       </div>
                       
                       <h4 className="font-bold text-lg text-gray-900 mb-1">{post.org_name || "Unknown Organization"}</h4>
                       
                       <div className="flex items-center gap-2 mb-3 text-xs font-medium text-gray-500">
                          <span className="flex items-center gap-1"><FaMapMarkerAlt /> {post.location}</span>
                          <span className="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                              <FaClock /> {post.duration || "Flexible"}
                          </span>
                       </div>

                       {/* Show Skills Needed by NGO */}
                       <div className="flex flex-wrap gap-1 mb-4">
                           {post.ai_needs && (typeof post.ai_needs === 'string' ? JSON.parse(post.ai_needs) : post.ai_needs).map((skill, idx) => (
                               <span key={idx} className={`text-[10px] px-2 py-1 rounded border ${detectedSkills.includes(skill) ? 'bg-teal-100 text-teal-800 border-teal-200 font-bold' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                   {skill}
                               </span>
                           ))}
                       </div>

                       <p className="text-sm text-gray-600 line-clamp-2 mb-4">"{post.raw_requirement}"</p>
                       
                       <button className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#319795] to-teal-600 text-white font-bold text-base shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2
">
                          Apply Now
                       </button>
                    </div>
                 ))
              ) : (
                 <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-3xl border border-dashed">
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
