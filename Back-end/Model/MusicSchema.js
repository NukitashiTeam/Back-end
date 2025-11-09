// models/User.js
const mongoose = require('mongoose');

const MusicSchema = new mongoose.Schema({
    track_id: String,
    title: String,
    artist: String,
    album: String,
    genre: String,
    mp3_url: String,
    image_url: String,
    is_premium: Boolean,
    release_date: Date,
    mood: String,
});

module.exports = mongoose.model('Music', MusicSchema, 'Musics');
