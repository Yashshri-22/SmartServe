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

    const ai_needs = await analyzeText(
      raw_requirement,
      "needs"
    );

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
      .select(); 

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
