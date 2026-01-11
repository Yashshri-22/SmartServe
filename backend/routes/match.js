// routes/match.js
const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");
const calculateMatchScore = require("../utils/matchScore");

router.post("/generate", async (req, res) => {
  try {
    const { volunteer_id, ngo_id } = req.body;

    if (!volunteer_id || !ngo_id) {
      return res.status(400).json({
        error: "volunteer_id and ngo_id are required"
      });
    }

    // Fetch volunteer
    const { data: volunteer, error: vErr } = await supabase
      .from("volunteers")
      .select("*")
      .eq("id", volunteer_id)
      .single();

    if (vErr) throw vErr;

    // Fetch NGO
    const { data: ngo, error: nErr } = await supabase
      .from("ngos")
      .select("*")
      .eq("id", ngo_id)
      .single();

    if (nErr) throw nErr;

    const { score, explanation } =
      calculateMatchScore(volunteer, ngo);

    const { data, error } = await supabase
      .from("matches")
      .insert([
        {
          volunteer_id,
          ngo_id,
          match_score: score,
          explanation
        }
      ])
      .select();

    if (error) throw error;

    res.json({
      success: true,
      match_score: score,
      explanation,
      data
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;
