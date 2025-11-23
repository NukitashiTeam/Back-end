// seeders/moodSeeder.js
const Mood = require('../Model/MoodSchema');


const GENRE_MAP = {
  // ===== HIGH ENERGY GENRES =====
  'Pop': ['happy', 'energetic', 'uplifting'],
  'Dance': ['energetic', 'happy', 'uplifting'],
  'Electronic': ['energetic', 'focused', 'uplifting'],
  'Hip-Hop/Rap': ['energetic', 'confident', 'focused'],
  'Rock': ['energetic', 'powerful', 'rebellious'],
  'Metal': ['angry', 'energetic', 'powerful'],
  'Punk': ['angry', 'energetic', 'rebellious'],
  'House': ['energetic', 'happy', 'hypnotic'],
  'Techno': ['energetic', 'hypnotic', 'focused'],
  
  // ===== CALM/RELAXED GENRES =====
  'Classical': ['calm', 'focused', 'elegant'],
  'Jazz': ['calm', 'sophisticated', 'romantic'],
  'Ambient': ['calm', 'relaxed', 'meditative'],
  'New Age': ['calm', 'meditative', 'peaceful'],
  'Acoustic': ['calm', 'intimate', 'reflective'],
  'Instrumental': ['focused', 'calm', 'peaceful'],
  
  // ===== EMOTIONAL GENRES =====
  'R&B/Soul': ['romantic', 'sensual', 'soulful'],
  'Soul': ['romantic', 'soulful', 'passionate'],
  'Blues': ['sad', 'melancholic', 'soulful'],
  'Folk': ['melancholic', 'reflective', 'nostalgic'],
  'Indie': ['melancholic', 'alternative', 'introspective'],
  'Alternative': ['melancholic', 'edgy', 'introspective'],
  
  // ===== FEEL-GOOD GENRES =====
  'Reggae': ['happy', 'relaxed', 'peaceful'],
  'Country': ['happy', 'nostalgic', 'storytelling'],
  'Latin': ['happy', 'passionate', 'energetic'],
  'Disco': ['happy', 'energetic', 'uplifting'],
  
  // ===== SPECIAL GENRES =====
  'Soundtrack': ['focused', 'cinematic', 'passionate'],
  'World': ['cultural', 'diverse', 'spiritual'],
  
  // ===== FALLBACK =====
  'default': ['happy']
};

// @ts-ignore
async function mapGenreToMoods(genre) {
  try {
    // @ts-ignore
    let moodNames = GENRE_MAP[genre];
    
    if (!moodNames) {
      console.warn(`⚠️ Genre "${genre}" không có trong map, dùng default`);
      moodNames = GENRE_MAP['default'];
    }
    
    const moods = await Mood.find({
      name: { $in: moodNames }
    });
    
    if (moods.length === 0) {
      console.warn(`⚠️ Không tìm thấy mood nào cho genre "${genre}"`);
      return [];
    }
    
    // 4. Phân bổ confidence
    const totalMoods = moods.length;
    
    const moodsWithConfidence = moods.map((mood, index) => {
      let confidence;
      
      if (index === 0) {
        // Mood đầu tiên (primary): 50%
        confidence = 0.5;
      } else {
        // Các mood còn lại: chia đều 50%
        confidence = 0.5 / (totalMoods - 1);
      }
      
      return {
        mood: mood._id,
        name: mood.name,
        confidence: parseFloat(confidence.toFixed(2))
      };
    });
    
    // 5. Sort theo confidence giảm dần
    return moodsWithConfidence.sort((a, b) => b.confidence - a.confidence);
    
  } catch (error) {
    console.error('❌ Error mapping genre to moods:', error);
    throw error;
  }
}

module.exports = {
  mapGenreToMoods
};