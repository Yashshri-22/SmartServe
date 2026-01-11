// routes/volunteer.js
const router = require("express").Router();
const supabase = require("../services/supabase");
const analyzeText = require("../services/gemini");

router.post("/create", async (req, res) => {
  try {
    const { user_id, raw_description, availability, location } = req.body;

    const ai_skills = await analyzeText(raw_description, "skills");

    const { data, error } = await supabase
      .from("volunteers")
      .insert([{ user_id, raw_description, ai_skills, availability, location }]).select();;

    if (error) throw error;

    res.json({ success: true, data, ai_skills });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
