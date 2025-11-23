// models/Mood.js
const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  displayName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  colorCode: {
    type: String,
    match: /^#[0-9A-F]{6}$/i
  },
  icon: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Mood', moodSchema);
