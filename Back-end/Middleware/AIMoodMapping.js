// @ts-nocheck
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Mood = require('../Model/MoodSchema');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeMoodWithAI(title, artist) {
  try {

    const availableMoods = await Mood.find().sort({ createdAt: -1 }).select('name');

    const moodNamesList = availableMoods.map(m => m.name);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    
    const moodListString = moodNamesList.join(", ");

    const prompt = `
      Analyze the mood of the song "${title}" by "${artist}".
      
      You must strictly select top 3 moods form this specific list: [${moodListString}].
      
      Return ONLY a JSON object (no markdown) with this format:
      {
        "moods": ["mood_from_list_1", "mood_from_list_2", "mood_from_list_3"],
        "explanation": "short reason"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean json string (đề phòng AI trả về markdown ```json ... ```)
    const jsonStr = text.replace(/```json|```/g, '').trim();
    
    return JSON.parse(jsonStr);

  } catch (error) {
    console.error("❌ Lỗi AI:", error.message);
    // Fallback nếu AI lỗi thì trả về null để code chính dùng Genre Map
    return null;
  }
}

module.exports = { analyzeMoodWithAI };