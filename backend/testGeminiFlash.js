require("dotenv").config();
const axios = require("axios");

async function testGemini() {
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Extract skills from this text and return ONLY a JSON array. Text: I like teaching kids and organizing events."
              }
            ]
          }
        ]
      },
      {
        params: {
          key: process.env.GEMINI_API_KEY
        },
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const output =
      response.data.candidates[0].content.parts[0].text;

    console.log("Gemini Output:", output);
  } catch (error) {
    console.error(
      "Gemini Error:",
      error.response?.data || error.message
    );
  }
}

testGemini();
