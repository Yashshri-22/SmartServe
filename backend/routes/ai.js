const express = require("express");
const router = express.Router();
const analyzeText = require("../gemini"); 

router.post("/analyze", async (req, res) => {
  const { text, type } = req.body;
  try {
    const skills = await analyzeText(text, type);
    res.json({ skills });
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    // Fallback to empty array on error so frontend doesn't crash
    res.json({ skills: [] }); 
  }
});

module.exports = router;