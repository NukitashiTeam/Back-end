// seeders/moodSeeder.js
const Mood = require('../Model/MoodSchema');

const moods = [
  // High energy
  { name: 'happy', displayName: 'Happy', description: 'Vui vẻ, phấn khởi', colorCode: '#FFD700', icon: '😊' },
  { name: 'energetic', displayName: 'Energetic', description: 'Năng động, mạnh mẽ', colorCode: '#FF4500', icon: '⚡' },
  { name: 'uplifting', displayName: 'Uplifting', description: 'Phấn chấn, nâng cao tinh thần', colorCode: '#FFA500', icon: '🚀' },
  { name: 'excited', displayName: 'Excited', description: 'Hứng khởi, phấn khích', colorCode: '#FF6347', icon: '🎉' },
  
  // Calm/Relaxed
  { name: 'calm', displayName: 'Calm', description: 'Bình tĩnh, thư giãn', colorCode: '#87CEEB', icon: '🌙' },
  { name: 'relaxed', displayName: 'Relaxed', description: 'Thư thái, nhẹ nhàng', colorCode: '#ADD8E6', icon: '☁️' },
  { name: 'peaceful', displayName: 'Peaceful', description: 'Yên bình, thanh thản', colorCode: '#B0E0E6', icon: '🕊️' },
  { name: 'meditative', displayName: 'Meditative', description: 'Thiền định, tĩnh tâm', colorCode: '#E0FFFF', icon: '🧘' },
  
  // Focused
  { name: 'focused', displayName: 'Focused', description: 'Tập trung, làm việc', colorCode: '#9370DB', icon: '🎯' },
  { name: 'concentrated', displayName: 'Concentrated', description: 'Chuyên chú, nghiêm túc', colorCode: '#8A2BE2', icon: '💡' },
  
  // Emotional - Positive
  { name: 'romantic', displayName: 'Romantic', description: 'Lãng mạn, tình cảm', colorCode: '#FF69B4', icon: '❤️' },
  { name: 'sensual', displayName: 'Sensual', description: 'Gợi cảm, quyến rũ', colorCode: '#FF1493', icon: '💋' },
  { name: 'passionate', displayName: 'Passionate', description: 'Đam mê, mãnh liệt', colorCode: '#DC143C', icon: '🔥' },
  { name: 'confident', displayName: 'Confident', description: 'Tự tin, mạnh mẽ', colorCode: '#FFD700', icon: '💪' },
  
  // Emotional - Negative
  { name: 'sad', displayName: 'Sad', description: 'Buồn bã, u sầu', colorCode: '#4169E1', icon: '😢' },
  { name: 'melancholic', displayName: 'Melancholic', description: 'Sầu muộn, hoài niệm', colorCode: '#6495ED', icon: '🌧️' },
  { name: 'angry', displayName: 'Angry', description: 'Tức giận, phẫn nộ', colorCode: '#8B0000', icon: '😠' },
  
  // Special moods
  { name: 'powerful', displayName: 'Powerful', description: 'Mạnh mẽ, hùng tráng', colorCode: '#B22222', icon: '⚔️' },
  { name: 'rebellious', displayName: 'Rebellious', description: 'Nổi loạn, phản kháng', colorCode: '#800000', icon: '🤘' },
  { name: 'sophisticated', displayName: 'Sophisticated', description: 'Tinh tế, sang trọng', colorCode: '#2F4F4F', icon: '🎩' },
  { name: 'elegant', displayName: 'Elegant', description: 'Thanh lịch, tao nhã', colorCode: '#708090', icon: '👑' },
  { name: 'hypnotic', displayName: 'Hypnotic', description: 'Mê hoặc, thôi miên', colorCode: '#9932CC', icon: '🌀' },
  { name: 'nostalgic', displayName: 'Nostalgic', description: 'Hoài niệm, nhớ nhung', colorCode: '#B8860B', icon: '📻' },
  { name: 'reflective', displayName: 'Reflective', description: 'Suy tư, trầm ngâm', colorCode: '#696969', icon: '💭' },
  { name: 'introspective', displayName: 'Introspective', description: 'Nội tâm, tự vấn', colorCode: '#778899', icon: '🤔' },
  { name: 'cinematic', displayName: 'Cinematic', description: 'Điện ảnh, hoành tráng', colorCode: '#483D8B', icon: '🎬' },
  { name: 'cultural', displayName: 'Cultural', description: 'Văn hóa, truyền thống', colorCode: '#CD853F', icon: '🌍' },
  { name: 'spiritual', displayName: 'Spiritual', description: 'Tâm linh, thiêng liêng', colorCode: '#DEB887', icon: '✨' },
  { name: 'storytelling', displayName: 'Storytelling', description: 'Kể chuyện, tường thuật', colorCode: '#F4A460', icon: '📖' },
  { name: 'alternative', displayName: 'Alternative', description: 'Thay thế, độc lập', colorCode: '#A9A9A9', icon: '🎸' },
  { name: 'edgy', displayName: 'Edgy', description: 'Táo bạo, sắc sảo', colorCode: '#696969', icon: '⚡' },
  { name: 'intimate', displayName: 'Intimate', description: 'Thân mật, riêng tư', colorCode: '#CD5C5C', icon: '🕯️' },
  { name: 'soulful', displayName: 'Soulful', description: 'Sâu lắng, tâm hồn', colorCode: '#8B4513', icon: '🎵' },
  { name: 'diverse', displayName: 'Diverse', description: 'Đa dạng, phong phú', colorCode: '#DAA520', icon: '🎨' }
];


// Hàm này dùng 1 lần thôi - không cần add thêm
// @ts-ignore
exports.addMoodIntoService = async (req, res) => {
    try {
       const {name, displayName, description, colorCode, icon} = req.body;
      //  const newMood = new Mood({
      //   name,
      //   displayName,
      //   description,
      //   colorCode,
      //   icon
      //  });
      await Mood.insertMany(moods);
      console.log(`✅ Seeded ${moods.length} moods`);
      res.status(201).json({ message: 'Mood created successfully', data: moods });
    }
    catch (error) {
    console.error('❌ Error seeding moods:', error);
    throw error;
  }
}
