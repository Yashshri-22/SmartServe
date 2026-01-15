const axios = require("axios");

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function cleanGeminiResponse(text) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

async function analyzeText(text, type = "skills") {
  let instruction =
    type === "skills"
      ? "Extract skills from the text. Return ONLY a JSON array."
      : "Extract required skills from the text. Return ONLY a JSON array.";

  const response = await axios.post(
    GEMINI_URL,
    {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `${instruction}\nText: "${text}"`
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

  const raw =
    response.data.candidates[0].content.parts[0].text;

  const cleaned = cleanGeminiResponse(raw);

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Gemini raw output:", raw);
    throw new Error("Failed to parse Gemini response");
  }
}

module.exports = analyzeText;
