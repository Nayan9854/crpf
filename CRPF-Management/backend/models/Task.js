const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  Task_Id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },

  assignedBy: { type: String, required: true }, // Sub-admin User_Id
  assignedTo: [{ type: String, required: true }], // Array of User_Ids

  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  location: { type: String },
  startTime: { type: Date },
  endTime: { type: Date },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Task', taskSchema);


// Fixed task status update logic
