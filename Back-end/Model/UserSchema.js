const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // provider: { type: String, enum: ['phone', 'google', 'facebook'], default: 'phone' }, // Kiểu đăng nhập
  phone: { type: String, unique: true, sparse: true, default: null},
  email: { type: String, unique: true, sparse: true, default: null},
  username: { type: String, required: true },
  password: { type: String }, 
  otp: { type: String },
  otpMethod: { type: String, enum: ['sms', 'email'] },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
  avatar: { type: String, default: ""},
  role: { type: String, default: 'user' },
  lastLogin: { type: Date },
  refreshToken: { type: String }, 
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
