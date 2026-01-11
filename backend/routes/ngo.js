// routes/ngo.js
const express = require("express");
const router = express.Router();

const supabase = require("../services/supabase");
const analyzeText = require("../services/gemini");

router.post("/create", async (req, res) => {
  try {
    const {
      user_id,
      raw_requirement,
      duration,
      location
    } = req.body;

    // 1️⃣ Ask Gemini to extract required skills
    const ai_needs = await analyzeText(
      raw_requirement,
      "needs"
    );

    // 2️⃣ Insert NGO record
    const { data, error } = await supabase
      .from("ngos")
      .insert([
        {
          user_id,
          raw_requirement,
          ai_needs,
          duration,
          location
        }
      ])
      .select(); // return inserted row

    if (error) throw error;

    res.json({
      success: true,
      data,
      ai_needs
    });

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

module.exports = router;
