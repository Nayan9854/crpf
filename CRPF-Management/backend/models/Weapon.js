const mongoose = require('mongoose');

const weaponSchema = new mongoose.Schema({
  Weapon_Id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String },

  assignedTo: { type: String }, // User_Id
  isOperational: { type: Boolean, default: true },
  addedBy: { type: String }, // Admin User_Id

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Weapon', weaponSchema);
