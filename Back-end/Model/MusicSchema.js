// models/User.js
const mongoose = require('mongoose');

const MusicSchema = new mongoose.Schema({
    track_id: { type: String },
    title: { 
        type: String, 
        required: true,
        index: true 
    },
    artist: { 
        type: String, 
        required: true,
        index: true 
    },
    album: { type: String },
    genre: { type: String },
    duration: { 
        type: Number, 
        required: true, 
        default: 0 
        // Lưu bằng giây. Ví dụ: 214 (giây)
    },
    mp3_url: { type: String, required: true },
    image_url: { type: String },
    release_date: { type: Date },
    moods: [
        {
            mood: { type: mongoose.Schema.Types.ObjectId, ref: 'Mood' }, // Link tới bảng Mood
            name: String,    
            confidence: Number,
            _id: false
        }
    ]
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Music', MusicSchema, 'Musics');
