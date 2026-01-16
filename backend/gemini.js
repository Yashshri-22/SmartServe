const axios = require("axios");

// Ensure you are using the correct model version available to you
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function cleanGeminiResponse(text) {
  // Removes markdown code blocks if Gemini adds them
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

async function analyzeText(text, type = "skills") {
  // --- NEW: STRICT PROMPT LOGIC ---
  const instruction = `
    You are a strict Validation AI for an NGO Volunteer Platform.
    
    USER INPUT: "${text}"
    
    YOUR TASK:
    1. First, analyze if this is a realistic, physically possible, and legal request for a human volunteer.
    2. If the request is impossible (e.g., "fly car to the moon", "time travel", "magic"), fictional, or gibberish, you MUST return exactly: ["Invalid Request"].
    3. If the request is valid, extract 1-5 professional skills required (e.g., "Teaching", "Medical", "Driving").

    EXAMPLES:
    - Input: "Need a pilot to fly car to moon" -> Output: ["Invalid Request"]
    - Input: "Need someone to teach math" -> Output: ["Teaching", "Mathematics"]
    - Input: "We need a time traveler" -> Output: ["Invalid Request"]
    - Input: "asdf jkl;" -> Output: ["Invalid Request"]

    OUTPUT FORMAT:
    Return ONLY a raw JSON array of strings. Do not add markdown or extra text.
  `;

  try {
    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: instruction // Send the complex prompt
              }
            ]
          }
        ]
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
        headers: { "Content-Type": "application/json" }
      }
    );

    // Extract text from Gemini response
    const raw =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    const cleaned = cleanGeminiResponse(raw);

    return JSON.parse(cleaned);

  } catch (err) {
    console.error("Gemini API Error:", err.response?.data || err.message);
    // Return empty array on failure so app doesn't crash
    return []; 
  }
}

module.exports = analyzeText;