// Model/ContextSchema.js
const mongoose = require('mongoose');

const contextSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  icon: {
    type: String,
    default: 'Sample.svg'
  },
  color: {
    type: String,
    default: '#FFFFFF'
  },
  moods: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mood'
  }],
  // QUAN TRỌNG: null = Admin/System, có ID = User
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null 
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  forkedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Context',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// --- INDEXING ---
// Tạo index cho field isSystem để query context admin cực nhanh
contextSchema.index({ isSystem: 1 });
// Tạo index cho ownerId để query context của user nhanh
contextSchema.index({ ownerId: 1 });

module.exports = mongoose.model('Context', contextSchema);