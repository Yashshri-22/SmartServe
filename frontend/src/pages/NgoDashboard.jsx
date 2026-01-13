import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient"; 
import { useAuth } from "../context/AuthContext"; 
import Navbar from "../components/Navbar";
import { 
  FaRobot, FaMapMarkerAlt, FaStar, 
  FaUser, FaHistory, FaSearch, FaPlus, FaSave
} from "react-icons/fa";

// Helper function for Mock AI (reused by both actions)
const getDetectedSkills = (text) => {
    const lowerText = text.toLowerCase();
    let skills = [];
    if (lowerText.includes("teach") || lowerText.includes("math") || lowerText.includes("school")) {
      skills = ["Teaching", "Math", "Science", "Childcare"];
    } else if (lowerText.includes("photo") || lowerText.includes("camera") || lowerText.includes("video")) {
      skills = ["Photography", "Video Editing", "Media"];
    } else if (lowerText.includes("code") || lowerText.includes("web") || lowerText.includes("app")) {
      skills = ["Web Development", "React", "Tech"];
    } else if (lowerText.includes("food") || lowerText.includes("drive") || lowerText.includes("help")) {
      skills = ["Logistics", "Driving", "General Help"];
    } else {
      skills = ["General Volunteering"];
    }
    return skills;
};

export default function NgoDashboard() {
  const { session } = useAuth();
  
  // Input State
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);
  
  // App State
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [myPosts, setMyPosts] = useState([]); 

  // --- FETCH PAST POSTS ON LOAD ---
  useEffect(() => {
    if (session?.user) {
      fetchMyPosts();
    }
  }, [session]);

  const fetchMyPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('ngos')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyPosts(data || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // --- ACTION 1: ONLY POST (Save to DB) ---
  const handlePost = async () => {
    if (!description || !location) return alert("Please fill all fields.");
    setLoading(true);
    try {
      if (session?.user) {
        const skills = getDetectedSkills(description);
        const { error } = await supabase.from('ngos').insert([{ 
            user_id: session.user.id,
            ai_needs: skills,
            raw_requirement: description, 
            location: location,
            duration: "Flexible"
        }]);
        if (error) throw error;
        fetchMyPosts(); // Refresh history
        alert("Requirement Posted Successfully!");
        resetForm();
      }
    } catch (error) {
      alert("Error posting: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- ACTION 2: ONLY FIND MATCH (Query DB) ---
  const handleFindMatch = async (e) => {
      e.preventDefault(); // Prevent form submisson trigger
      if (!description || !location) return alert("Please fill all fields.");
      setLoading(true);
      setAiResult(null);

      try {
        const detectedSkills = getDetectedSkills(description);

        // Fetch volunteers in location
        const { data: volunteers, error } = await supabase
          .from('volunteers')
          .select('*')
          .ilike('location', location); 

        if (error) throw error;

        // Score matches based on skill overlap
        const matches = volunteers.map(vol => {
          let volSkills = vol.ai_skills || [];
          if (typeof volSkills === 'string') volSkills = JSON.parse(volSkills);

          const overlap = volSkills.filter(skill => 
            detectedSkills.some(need => skill.toLowerCase().includes(need.toLowerCase()))
          );

          if (overlap.length > 0) {
            return {
              ...vol,
              score: Math.min(60 + (overlap.length * 15), 98),
              matchedSkills: overlap
            };
          }
          return null;
        }).filter(Boolean).sort((a, b) => b.score - a.score);

        setAiResult({ skills: detectedSkills, matches });

      } catch (error) {
        console.error("Matching Error:", error);
        alert("Something went wrong finding matches.");
      } finally {
        setLoading(false);
      }
  };


  const loadFromHistory = (post) => {
    setSelectedPostId(post.id);
    setDescription(post.raw_requirement);
    setLocation(post.location);
    setAiResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setSelectedPostId(null);
    setDescription("");
    setLocation("");
    setAiResult(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 font-sans selection:bg-teal-100 relative overflow-x-hidden">
      <Navbar />

      {/* Background Image */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] -z-10 opacity-10 pointer-events-none">
        <img 
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            alt="Volunteers"
            className="w-full h-full object-cover rounded-bl-[10rem]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-gray-50/80"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20 relative z-10">
        
        {/* Header */}
        <div className="mb-10 text-center mx-auto max-w-3xl">
           <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
             NGO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#319795] to-teal-500">Dashboard</span>
           </h1>
           <p className="text-lg text-gray-600 font-medium">
             Post requirements or instantly find volunteers using our <span className="text-teal-700 font-bold">AI Matching Engine</span>.
           </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN ================= */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-28">
            
            {/* 1. INPUT CARD */}
            <div className={`bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border relative overflow-hidden transition-all duration-300 ${selectedPostId ? 'border-teal-400 ring-4 ring-teal-50' : 'border-white/50 ring-1 ring-gray-200/50'}`}>
              
              {/* Context Banner */}
              {selectedPostId ? (
                <div className="bg-teal-50 text-teal-700 px-4 py-2 -mt-6 -mx-6 mb-4 flex justify-between items-center border-b border-teal-100">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                    <FaHistory /> Viewing Past Post
                  </span>
                  <button onClick={resetForm} className="text-xs font-bold underline hover:text-teal-900 flex items-center gap-1">
                    <FaPlus /> Create New
                  </button>
                </div>
              ) : (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-teal-600"></div>
              )}

              <h2 className="text-lg font-bold mb-5 flex items-center gap-3 text-gray-800">
                <div className={`p-2 rounded-xl text-xl ${selectedPostId ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-500'}`}>
                    <FaRobot /> 
                </div>
                <span>AI Requirement Scanner</span>
              </h2>

              <form onSubmit={handleFindMatch} className="relative z-10">
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Describe your Need</label>
                  <textarea
                    placeholder="e.g. We need a math teacher for 10 kids this weekend..."
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:border-[#319795] focus:ring-2 focus:ring-teal-500/10 outline-none h-32 resize-none text-sm text-gray-700 placeholder:text-gray-400 font-medium transition-all"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Location</label>
                  
                  {/* FLEX CONTAINER: Acts as the border. Icon and Input sit side-by-side. */}
                  <div className="flex items-center w-full bg-gray-50 border border-gray-200 rounded-2xl focus-within:border-[#319795] focus-within:ring-2 focus-within:ring-teal-500/10 transition-all overflow-hidden">
                    
                    {/* ICON: Fixed width, never overlaps */}
                    <div className="pl-4 pr-2 text-teal-500 text-lg shrink-0">
                      <FaMapMarkerAlt />
                    </div>

                    {/* INPUT: Background transparent, no border (parent has the border) */}
                    <input
                      type="text"
                      placeholder="e.g. Pune"
                      className="w-full py-3 pr-4 bg-transparent border-none outline-none text-sm text-gray-700 font-medium placeholder:text-gray-400"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* --- SEPARATE BUTTONS --- */}
                <div className="flex flex-col gap-3">
                    {/* Button 1: Find Match (Secondary Action - Dark Gray) */}
                    <button
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#319795] to-teal-600 text-white font-bold text-base shadow-lg hover:shadow-teal-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                        {loading ? "Processing..." : <><FaSearch /> Find Match</>}
                    </button>

                    {/* Button 2: Post Requirement (Primary Action - Teal Theme) */}
                    {!selectedPostId && ( 
                        <button
                        type="button" 
                        onClick={handlePost} 
                        disabled={loading}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#319795] to-teal-600 text-white font-bold text-base shadow-lg hover:shadow-teal-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                        <FaSave /> Post Requirement
                        </button>
                    )}
                </div>
              </form>
            </div>

            {/* 2. RECENT POSTS WIDGET */}
            <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 w-full">
              <h3 className="font-bold text-base text-gray-700 mb-4 flex items-center gap-2">
                <FaHistory className="text-teal-500" /> Recent Posts
              </h3>
              
              {myPosts.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <p>No history yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {myPosts.map((post) => (
                    <div 
                      key={post.id} 
                      onClick={() => loadFromHistory(post)}
                      className={`group p-3 rounded-xl border cursor-pointer transition-all duration-200 w-full ${
                        selectedPostId === post.id 
                        ? "bg-teal-50 border-teal-300 ring-1 ring-teal-300" 
                        : "bg-gray-50 border-transparent hover:border-teal-200 hover:bg-teal-50/50"
                      }`}
                    >
                      <div className="flex flex-wrap justify-between items-center mb-2 gap-2">
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider bg-teal-100 px-2 py-0.5 rounded-lg whitespace-nowrap">
                          {post.location}
                        </span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">
                           {new Date(post.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className={`text-xs line-clamp-2 font-medium ${selectedPostId === post.id ? "text-teal-800" : "text-gray-600"}`}>
                        {post.raw_requirement}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN (RESULTS) ================= */}
          <div className="lg:col-span-7 pb-10">
            
            {/* 1. EMPTY STATE */}
            {!aiResult && !loading && (
              <div className="flex flex-col items-center justify-center text-center p-10 bg-white/60 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-gray-200 min-h-[400px]">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-300">
                  <FaSearch className="text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-400">Ready to Match</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                  Enter details and click <b>"Find Match"</b> to see volunteers, or <b>"Post Requirement"</b> to save it to your history.
                </p>
              </div>
            )}

            {/* 2. LOADING STATE */}
            {loading && (
              <div className="flex flex-col items-center justify-center p-16 min-h-[400px] bg-white rounded-[2rem] shadow-xl border border-gray-100">
                <div className="relative mb-6">
                  <div className="w-16 h-16 border-4 border-gray-100 rounded-full"></div>
                  <div className="w-16 h-16 border-4 border-[#319795] border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 animate-pulse">AI Engine Running...</h3>
                <p className="text-sm text-gray-500 mt-2">Parsing requirements • Scoring candidates</p>
              </div>
            )}

            {/* 3. RESULTS DISPLAY */}
            {aiResult && (
              <div className="animate-fade-in-up space-y-6">
                
                {/* AI Skills Summary Box */}
                <div className="bg-gradient-to-br from-teal-50 via-white to-teal-50/30 border border-teal-100 p-6 rounded-[2rem] shadow-sm">
                  <h3 className="text-teal-800 font-bold text-xs uppercase mb-4 flex items-center gap-2 tracking-widest">
                    <FaRobot className="text-lg" /> AI Detected Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {aiResult.skills.map((skill, index) => (
                      <span key={index} className="px-4 py-2 bg-white text-teal-800 text-xs font-bold rounded-xl shadow-sm border border-teal-100 hover:scale-105 transition-transform cursor-default">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Results Header */}
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    Matches Found 
                    <span className="bg-gray-900 text-teal-400 text-xs px-2.5 py-1 rounded-full shadow-md">{aiResult.matches.length}</span>
                  </h3>
                  <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">Top Matches</span>
                </div>

                {/* Volunteer Cards List - SMALLER & COMPACT */}
                <div className="grid gap-4">
                  {aiResult.matches.length > 0 ? (
                    aiResult.matches.map((vol) => (
                      // Reduced padding (p-5) and border radius (rounded-2xl)
                      <div key={vol.id} className="bg-white p-5 rounded-2xl shadow-sm border border-transparent hover:border-teal-300 hover:shadow-lg transition-all duration-300 group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-lg font-black uppercase group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors shrink-0">
                              {vol.name ? vol.name.charAt(0) : <FaUser />}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg text-gray-900 group-hover:text-[#319795] transition-colors">
                                {vol.name || "Volunteer"}
                              </h4>
                              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1 font-medium">
                                  <FaMapMarkerAlt className="text-teal-500" /> {vol.location} 
                              </p>
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                  {Array.isArray(vol.matchedSkills) && vol.matchedSkills.slice(0, 3).map((s, i) => (
                                      <span key={i} className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-1 rounded-lg border border-teal-100 uppercase tracking-wide">
                                          {s}
                                      </span>
                                  ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 pl-0 sm:pl-6 sm:border-l sm:border-gray-100 w-full sm:w-auto">
                            <div className="text-right">
                              <div className="text-2xl font-black text-gray-900 flex items-center sm:justify-end gap-0.5">
                                {vol.score}<span className="text-teal-500 text-base">%</span>
                              </div>
                              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 justify-end">
                                Match Score
                              </div>
                            </div>
                            
                            {/* SOLID BLACK BUTTON */}
                            <button className="w-full sm:w-auto px-6 py-2 bg-black text-white text-xs font-bold rounded-xl hover:opacity-80 transition-all shadow-md">
                              Contact
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-10 bg-white rounded-3xl border border-dashed border-gray-300">
                      <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <FaUser className="text-2xl" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-700">No matches found yet</h4>
                      <p className="text-gray-500 mt-2 text-sm max-w-xs mx-auto">
                        No volunteers in <span className="font-bold text-gray-900">{location}</span> match these skills.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}