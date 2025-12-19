// Model/PlaylistSchema.js
const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
    title: { type: String, required: true },
    thumbnail: { type: String },
    // Kiểu playlist: 'random' (máy tạo) hoặc 'manual' (người dùng tạo)
    type: { type: String, enum: ['random', 'manual'], default: 'manual' },
    // Mood/Context là không bắt buộc (Optional)
    mood: { type: String, index: true }, 
    context: { type: String, index: true },
    // Danh sách bài hát (Lưu tối giản như đã bàn)
    songs: [{
        songId: { type: mongoose.Schema.Types.ObjectId, ref: 'Music' },
        title: String,
        artist: String,
        addedAt: { type: Date, default: Date.now },
        _id: false
    }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPublic: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Playlist', PlaylistSchema);