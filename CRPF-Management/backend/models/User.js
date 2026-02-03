const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  User_Id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, unique: true },
  password: { type: String },

  role: { type: String, enum: ['admin', 'sub-admin', 'personnel'], required: true },
  rank: { type: String }, // Only for personnel
  serviceNumber: { type: String, unique: true },

  adminId: { type: String }, // For sub-admins
  subAdminId: { type: String }, // For personnel

  weaponsAssigned: [{ type: String }], // Array of Weapon_Id
  status: { type: String, enum: ['onduty', 'onleave'], default: 'onduty' },
  availability: { type: String, enum: ['tasked', 'free'], default: 'free' },

  currentTaskId: { type: String, default: null }, // Task_Id

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

// Added email validation schema
