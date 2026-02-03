const User = require('../models/User');
const Weapon = require('../models/Weapon');
const Task = require('../models/Task'); 

const getPersonnel = async (req, res) => {
  try {
    
    const personnel = await User.find({ 
      role: 'personnel',
      status: 'onduty' // Only on-duty personnel
    }).select('User_Id name rank');
    res.json(personnel);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch personnel', details: err.message });
  }
};


// ✅ Get User
const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
};


// ✅ Add User
const addUser = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (err) {
    res.status(400).json({ error: 'Failed to create user', details: err.message });
  }
};


// ✅ Update User
const updateUser = async (req, res) => {
  try {
    const { User_Id } = req.params;
    const updatedUser = await User.findOneAndUpdate(
      { User_Id },
      { $set: req.body },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User updated', updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Error updating user', details: err.message });
  }
};


// ✅ Delete User
const deleteUser = async (req, res) => {
  try {
    const { User_Id } = req.params;
    const deleted = await User.findOneAndDelete({ User_Id });
    if (!deleted) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting user', details: err.message });
  }
};


// ✅ Add Weapon
const addWeapon = async (req, res) => {
  try {
    const weapon = new Weapon(req.body);
    await weapon.save();
    res.status(201).json({ message: 'Weapon added successfully', weapon });
  } catch (err) {
    res.status(400).json({ error: 'Failed to add weapon', details: err.message });
  }
};


// ✅ Update Weapon
const updateWeapon = async (req, res) => {
  try {
    const { Weapon_Id } = req.params;
    const newAssignedTo = req.body.assignedTo;

    // Find the current weapon
    const weapon = await Weapon.findOne({ Weapon_Id });
    if (!weapon) return res.status(404).json({ error: 'Weapon not found' });

    const prevAssignedTo = weapon.assignedTo;

    // Update the weapon
    const updatedWeapon = await Weapon.findOneAndUpdate(
      { Weapon_Id },
      { $set: { ...req.body, updatedAt: new Date() } },
      { new: true }
    );

    // If assignedTo has changed
    if (prevAssignedTo && prevAssignedTo !== newAssignedTo) {
      // Remove weapon from previous user's weaponsAssigned
      await User.findOneAndUpdate(
        { User_Id: prevAssignedTo },
        { $pull: { weaponsAssigned: Weapon_Id } }
      );
    }

    if (newAssignedTo && prevAssignedTo !== newAssignedTo) {
      // Add weapon to new user's weaponsAssigned
      await User.findOneAndUpdate(
        { User_Id: newAssignedTo },
        { $addToSet: { weaponsAssigned: Weapon_Id } }
      );
    }

    // Fetch the new assigned user's info (if assigned)
    let assignedUser = null;
    if (updatedWeapon.assignedTo) {
      assignedUser = await User.findOne(
        { User_Id: updatedWeapon.assignedTo },
        { password: 0 } // exclude password
      );
    }

    res.json({
      message: 'Weapon updated',
      updatedWeapon,
      assignedUser: assignedUser || null
    });
  } catch (err) {
    res.status(500).json({ error: 'Error updating weapon', details: err.message });
  }
};

// ✅ Delete Weapon
const deleteWeapon = async (req, res) => {
  try {
    const { Weapon_Id } = req.params;
    const deleted = await Weapon.findOneAndDelete({ Weapon_Id });
    if (!deleted) return res.status(404).json({ error: 'Weapon not found' });

    res.json({ message: 'Weapon deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting weapon', details: err.message });
  }
};

const getWeapons = async (req, res) => {
  try {
    const weapons = await Weapon.find();
    res.json(weapons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weapons', details: err.message });
  }
};

// Get all tasks (for admin dashboard)
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 }); // newest first
    res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
  }
};

//Update tasks 
const updateTask = async (req, res) => {
  try {
    const { Task_Id } = req.params;

    // Fetch the existing task
    const existingTask = await Task.findOne({ Task_Id });
    if (!existingTask) return res.status(404).json({ error: 'Task not found' });

    // Extract fields to update (exclude Task_Id if passed)
    const {
      title,
      description,
      assignedBy,
      assignedTo = [],
      status,
      location,
      startTime,
      endTime
    } = req.body;

    // Determine user assignment changes
    const oldAssignedTo = existingTask.assignedTo.map(String);
    const newAssignedTo = assignedTo.map(String);

    const removedUsers = oldAssignedTo.filter(id => !newAssignedTo.includes(id));
    const addedUsers = newAssignedTo.filter(id => !oldAssignedTo.includes(id));

    // Remove task from old users
    await User.updateMany(
      { User_Id: { $in: removedUsers }, currentTaskId: Task_Id },
      { $set: { currentTaskId: null, availability: 'free' } }
    );

    // Add task to newly assigned users
    await User.updateMany(
      { User_Id: { $in: addedUsers } },
      { $set: { currentTaskId: Task_Id, availability: 'tasked' } }
    );

    // Update task
    const updatedTask = await Task.findOneAndUpdate(
      { Task_Id },
      {
        $set: {
          title,
          description,
          assignedBy,
          assignedTo: newAssignedTo,
          status,
          location,
          startTime,
          endTime,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    res.json({
      message: 'Task updated successfully',
      updatedTask
    });
  } catch (err) {
    res.status(500).json({
      error: 'Error updating task',
      details: err.message
    });
  }
};

const addTask = async (req, res) => {
  try {
    const {
      Task_Id,
      title,
      description,
      assignedBy,
      assignedTo = [],
      status,
      location,
      startTime,
      endTime
    } = req.body;

    // Check for duplicate Task_Id
    const existing = await Task.findOne({ Task_Id });
    if (existing) return res.status(400).json({ error: 'Task_Id already exists' });

    // Create the new task
    const newTask = new Task({
      Task_Id,
      title,
      description,
      assignedBy,
      assignedTo,
      status,
      location,
      startTime,
      endTime
    });

    await newTask.save();

    // Update assigned users
    await User.updateMany(
      { User_Id: { $in: assignedTo } },
      { $set: { currentTaskId: Task_Id, availability: 'tasked' } }
    );

    res.status(201).json({ message: 'Task created successfully', task: newTask });
  } catch (err) {
    res.status(500).json({ error: 'Error creating task', details: err.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { Task_Id } = req.params;

    // Find the task
    const task = await Task.findOne({ Task_Id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    // Clear task assignment from users
    await User.updateMany(
      { User_Id: { $in: task.assignedTo }, currentTaskId: Task_Id },
      { $set: { currentTaskId: null, availability: 'free' } }
    );

    // Delete the task
    await Task.deleteOne({ Task_Id });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting task', details: err.message });
  }
};

const getFreePersonnel = async (req, res) => {
  try {
    const freePersonnel = await User.find({
      role: 'personnel',
      availability: 'free',
      status: 'onduty'
    });

    res.status(200).json({
      message: 'Free personnel fetched successfully',
      personnel: freePersonnel
    });
  } catch (err) {
    res.status(500).json({
      error: 'Failed to fetch free personnel',
      details: err.message
    });
  }
};

module.exports = {
  getFreePersonnel,
  deleteTask,
  addTask,
  getAllTasks,
  updateTask,
  getPersonnel,
  addUser,
  updateUser,
  deleteUser,
  addWeapon,
  updateWeapon,
  deleteWeapon,
  getUsers,
  getWeapons
};

// Fixed admin data filtering issue
