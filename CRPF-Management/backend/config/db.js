const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file
const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://NayanJyothiBhattarai:NayanJyothiBhattarai@cluster0.ybbwtkm.mongodb.net/CRPF?retryWrites=true&w=majority&appName=Cluster0/CRPF', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connected Successfully`);
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1); // Exit on failure
  }
};

module.exports = connectDB;
