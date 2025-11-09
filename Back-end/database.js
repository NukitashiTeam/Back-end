const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URL;

  if (!uri) {
    throw new Error('MONGO_URL is not defined in environment variables');
  }

  try {
    // console.log('Connecting to:', uri);
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
