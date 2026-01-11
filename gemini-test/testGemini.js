require("dotenv").config();
const axios = require("axios");

async function testGemini() {
  try {
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text: "Extract skills from this text. Return only JSON array. Text: I like teaching kids and organizing events."
              }
            ]
          }
        ]
      },
      {
        params: {
          key: process.env.GEMINI_API_KEY
        }
      }
    );

    console.log(
      response.data.candidates[0].content.parts[0].text
    );
  } catch (err) {
    console.error("Gemini Error:", err.response?.data || err.message);
  }
}

testGemini();
