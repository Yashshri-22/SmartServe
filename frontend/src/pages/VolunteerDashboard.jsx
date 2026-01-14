import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import { 
  FaRobot, FaMapMarkerAlt, FaSearch, FaClock, FaPencilAlt, 
  FaBuilding, FaCheckCircle, FaUser, FaFileUpload, FaPhoneAlt, FaBriefcase, FaCheck, FaEnvelope
} from "react-icons/fa";

// --- 1. UPGRADED AI SKILL DETECTION (Better Logic) ---
const getDetectedSkills = (text) => {
    if (!text) return [];
    const lowerText = text.toLowerCase();
    let skills = [];

    // Education
    if (lowerText.includes("teach") || lowerText.includes("tutor")) skills.push("Teaching");
    if (lowerText.includes("math")) skills.push("Math");
    if (lowerText.includes("science")) skills.push("Science");
    if (lowerText.includes("kid") || lowerText.includes("child")) skills.push("Childcare");

    // Arts & Music
    if (lowerText.includes("photo") || lowerText.includes("camera")) skills.push("Photography");
    if (lowerText.includes("dance") || lowerText.includes("dancing")) skills.push("Dancing");
    if (lowerText.includes("sing") || lowerText.includes("music") || lowerText.includes("song")) skills.push("Singing/Music");
    if (lowerText.includes("paint") || lowerText.includes("draw") || lowerText.includes("art")) skills.push("Art");

    // Tech
    if (lowerText.includes("web") || lowerText.includes("code") || lowerText.includes("react")) skills.push("Web Development");
    if (lowerText.includes("video") || lowerText.includes("edit")) skills.push("Video Editing");

    // Logistics
    if (lowerText.includes("drive") || lowerText.includes("car")) skills.push("Driving");
    if (lowerText.includes("food") || lowerText.includes("cook")) skills.push("Cooking");

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

  // --- 1. CHECK PROFILE ON LOAD ---
  useEffect(() => {
    if (session?.user) {
      checkProfile();
      fetchApplications(); 
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
        setContactNo(data.contact_no);
        
        // Load saved preferences
        if (data.interest) setDescription(data.interest);
        if (data.location) setLocation(data.location);
        if (data.availability) setAvailability(data.availability);
        if (data.email) setEmail(data.email); else setEmail(session.user.email);
        
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

  const fetchApplications = async () => {
      try {
          const { data, error } = await supabase
            .from('applications')
            .select('ngo_post_id')
            .eq('volunteer_id', session.user.id);
          
          if (error) throw error;
          setAppliedPostIds(data.map(app => app.ngo_post_id));
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
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from('resumes') 
            .upload(fileName, resumeFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(fileName);

        const { error: dbError } = await supabase
            .from('volunteers')
            .upsert({
                user_id: session.user.id,
                full_name: fullName,
                contact_no: contactNo,
                experience: experience,
                resume_url: publicUrl,
                email: session.user.email,
                location: "", 
                interest: "", 
                availability: "",
                ai_skills: [] 
            }, { onConflict: 'user_id' });

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
      if (!description) return alert("Please describe how you want to help first.");

      setLoading(true);
      try {
          const currentSkills = getDetectedSkills(description);
          setDetectedSkills(currentSkills);

          // Update Volunteer Data including Email
          const { error: updateError } = await supabase
            .from('volunteers')
            .update({
                interest: description,
                location: location,
                availability: availability,
                email: email, 
                ai_skills: currentSkills 
            })
            .eq('user_id', session.user.id);

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
        .from('ngos')
        .select('*')
        .order('created_at', { ascending: false });

      // FIX: Added backticks for template literal
      if (searchLocation && searchLocation.trim() !== "") {
        query = query.ilike('location', `%${searchLocation}%`);
      }

      const { data: allPosts, error } = await query;
      if (error) throw error;

      let finalPosts = allPosts || [];

      // STRICT FILTERING: Only show posts that match at least one skill
      if (activeSkills.length > 0) {
          finalPosts = finalPosts.filter(post => {
             let ngoNeeds = post.ai_needs;
             
             // Handle JSON or string format of skills
             if (typeof ngoNeeds === 'string') {
                 try { ngoNeeds = JSON.parse(ngoNeeds); } catch(e) { ngoNeeds = []; }
             }
             if (!Array.isArray(ngoNeeds)) ngoNeeds = [];

             // Case-insensitive comparison
             const hasMatch = ngoNeeds.some(need => 
                 activeSkills.some(skill => skill.toLowerCase() === need.toLowerCase())
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
          const subject = encodeURIComponent(`Volunteer Application: ${post.org_name}`);
          const body = encodeURIComponent(
              `Hello,\n\nI am interested in applying for your post regarding: "${post.raw_requirement}".\n\n` +
              `My Name: ${fullName}\n` +
              `My Email: ${email || session.user.email}\n` +   
              `My Contact: ${contactNo}\n\n` +
              `Experience: ${experience}\n\n` +
              `Looking forward to hearing from you.`
          );
          
          const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${post.email}&su=${subject}&body=${body}`;
          window.open(gmailUrl, '_blank'); 
      } else {
          alert("Application Recorded.\n\nNote: This specific NGO post does not have an email address saved.");
      }

      setAppliedPostIds([...appliedPostIds, post.id]);

      try {
          const { error } = await supabase
            .from('applications')
            .insert([{
                ngo_post_id: post.id,
                volunteer_id: session.user.id,
                status: 'pending'
            }]);

          if (error) throw error;

      } catch (error) {
          console.error("Apply Error:", error);
      }
  };

  if (checkingProfile) return <div className="h-screen flex items-center justify-center text-teal-600">Loading...</div>;

  // ================= VIEW 1: IDENTITY FORM =================
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
                                {/* FIX: Corrected className syntax with quotes */}
                                <input type="text" className="w-full p-3 bg-gray-50 rounded-xl border outline-none focus:ring-2 focus:ring-teal-500/20" value={fullName} onChange={(e) => setFullName(e.target.value)} required placeholder="e.g. John Doe" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contact Number</label>
                                <input 
                                    type="text" 
                                    maxLength={10}
                                    className="w-full p-3 bg-gray-50 rounded-xl border outline-none focus:ring-2 focus:ring-teal-500/20" 
                                    value={contactNo} 
                                    onChange={handleContactChange} 
                                    required 
                                    placeholder="e.g. 9876543210" 
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

                        <button type="submit" disabled={uploading} className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#319795] to-teal-600 text-white font-bold text-base shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {uploading ? "Saving..." : "Save & Continue to Dashboard"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
  }

  // ================= VIEW 2: DASHBOARD =================
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

                 {/* --- NEW EMAIL INPUT --- */}
                 <div>
                        <label className="text-xs font-bold text-gray-500 uppercase mb-2 block"><FaEnvelope className="inline mr-1"/> Your Email (For Applications)</label>
                        <input 
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm"
                           placeholder="your-email@example.com"
                        />
                 </div>

                 <button 
                    onClick={handleFindOpportunities} 
                    disabled={loading}
                    className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#319795] to-teal-600 text-white font-bold text-base shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                 opportunities.map((post) => {
                    const isApplied = appliedPostIds.includes(post.id); 

                    return (
                    <div key={post.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
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

                       <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">"{post.raw_requirement}"</p>
                       
                       {/* APPLY BUTTON (Dynamic) */}
                       <button 
                          onClick={() => handleApply(post)}
                          disabled={isApplied}
                          className={` w-full py-3 rounded-2xl bg-gradient-to-r from-[#319795] to-teal-600 text-white font-bold text-base shadow-lg hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2
                            ${isApplied 
                                ? 'bg-green-100 text-green-700 cursor-default border border-green-200' 
                                : 'bg-gray-900 text-white hover:opacity-90 shadow-md'
                            }`}
                       >
                          {isApplied ? <><FaCheck /> Applied</> : "Apply Now"}
                       </button>
                    </div>
                 )})
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