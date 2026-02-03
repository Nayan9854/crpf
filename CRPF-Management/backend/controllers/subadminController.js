const User = require('../models/User');
const Task = require('../models/Task');
const Weapon = require('../models/Weapon');

const fetchTasks = async (req, res) => {
  try {
    const { subAdminId } = req.params;
    const tasks = await Task.find({ assignedBy: subAdminId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
  }
};

// ✅ 1. Assign a new task (only to own personnel)
const assignTask = async (req, res) => {
  try {
    const {
      Task_Id,
      title,
      description,
      assignedBy,
      assignedTo,
      location,
      startTime,
      endTime
    } = req.body;

    // Authorization: Ensure all assigned users are under this sub-admin
    const personnel = await User.find({
      User_Id: { $in: assignedTo },
      subAdminId: assignedBy,
      role: 'personnel'
    });

    if (personnel.length !== assignedTo.length) {
      return res.status(403).json({ error: 'Some users are not under your control' });
    }

    const newTask = new Task({
      Task_Id,
      title,
      description,
      assignedBy,
      assignedTo,
      location,
      startTime,
      endTime
    });

    await newTask.save();

    // Update users' currentTaskId and availability
    await User.updateMany(
      { User_Id: { $in: assignedTo } },
      { $set: { currentTaskId: Task_Id, availability: 'tasked' } }
    );

    res.status(201).json({ message: 'Task assigned successfully', task: newTask });
  } catch (err) {
    res.status(400).json({ error: 'Failed to assign task', details: err.message });
  }
};

// ✅ 2. Update a task (only if created by sub-admin)
const updateTask = async (req, res) => {
  try {
    const { Task_Id } = req.params;
    const { assignedBy, assignedTo } = req.body;

    // 1. Verify task exists and belongs to this sub-admin
    const task = await Task.findOne({ Task_Id });
    if (!task || task.assignedBy !== assignedBy) {
      return res.status(403).json({ error: 'Unauthorized or task not found' });
    }

    // 2. Verify all new assigned users are under this sub-admin
    if (assignedTo) {
      const personnel = await User.find({
        User_Id: { $in: assignedTo },
        subAdminId: assignedBy,
        role: 'personnel'
      });

      if (personnel.length !== assignedTo.length) {
        return res.status(403).json({ error: 'Some users are not under your control' });
      }
    }

    // 3. Get current assigned users before update
    const currentAssignedTo = task.assignedTo || [];

    // 4. Update the task
    const updatedTask = await Task.findOneAndUpdate(
      { Task_Id },
      { $set: req.body },
      { new: true }
    );

    // 5. Handle personnel assignment changes if assignedTo was modified
    if (assignedTo) {
      const newAssignedTo = updatedTask.assignedTo || [];
      
      // Users to remove from task (were assigned but aren't anymore)
      const usersToRemove = currentAssignedTo.filter(
        userId => !newAssignedTo.includes(userId)
      );
      
      // Users to add to task (newly assigned)
      const usersToAdd = newAssignedTo.filter(
        userId => !currentAssignedTo.includes(userId)
      );

      // Update users being removed from task
      if (usersToRemove.length > 0) {
        await User.updateMany(
          { User_Id: { $in: usersToRemove } },
          { $set: { currentTaskId: null, availability: 'free' } }
        );
      }

      // Update users being added to task
      if (usersToAdd.length > 0) {
        await User.updateMany(
          { User_Id: { $in: usersToAdd } },
          { $set: { currentTaskId: Task_Id, availability: 'tasked' } }
        );
      }
    }

    res.json({ 
      message: 'Task updated successfully', 
      task: updatedTask 
    });
  } catch (err) {
    res.status(500).json({ 
      error: 'Error updating task', 
      details: err.message 
    });
  }
};

// ✅ 3. Delete a task (only if created by sub-admin)
const deleteTask = async (req, res) => {
  try {
    const { Task_Id } = req.params;

    const task = await Task.findOne({ Task_Id });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const assignedPersonnel = task.assignedTo || [];

    await Task.deleteOne({ Task_Id });

    await User.updateMany(
      { User_Id: { $in: assignedPersonnel } },
      { $set: { currentTaskId: null, availability: 'free' } }
    );

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting task', details: err.message });
  }
};


// ✅ 4. Get all personnel under sub-admin with enhanced information
const getMyPersonnel = async (req, res) => {
  try {
    const { subAdminId } = req.params;
    
    // Fetch personnel with populated task information
    const personnel = await User.find({ subAdminId, role: 'personnel' }).lean();
    
    // Get task details for each personnel
    const personnelWithTaskDetails = await Promise.all(
      personnel.map(async (person) => {
        if (person.currentTaskId) {
          const task = await Task.findOne({ Task_Id: person.currentTaskId }).lean();
          return {
            ...person,
            currentTask: task ? {
              Task_Id: task.Task_Id,
              title: task.title,
              description: task.description,
              location: task.location,
              startTime: task.startTime,
              endTime: task.endTime,
              status: task.status || 'active'
            } : null
          };
        }
        return { ...person, currentTask: null };
      })
    );

    res.json(personnelWithTaskDetails);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch personnel', details: err.message });
  }
};

// ✅ 5. Update personnel (unified update function)
const updatePersonnelStatus = async (req, res) => {
  try {
    const { User_Id } = req.params;
    const { subAdminId, status, availability, currentTaskId } = req.body;

    const personnel = await User.findOne({ User_Id, role: 'personnel' });

    if (!personnel || personnel.subAdminId !== subAdminId) {
      return res.status(403).json({ error: 'Unauthorized or personnel not found' });
    }

    const updateData = {};

    if (status !== undefined) {
      updateData.status = status;
      if (status === 'onleave') {
        updateData.currentTaskId = null;
        updateData.availability = 'free';
      }
    }

    if (availability !== undefined) {
      updateData.availability = availability;
      if (availability === 'free') {
        updateData.currentTaskId = null;
      }
    }

    if (currentTaskId !== undefined) {
      updateData.currentTaskId = currentTaskId;
      updateData.availability = currentTaskId ? 'tasked' : 'free';
    }

    const updatedUser = await User.findOneAndUpdate(
      { User_Id },
      { $set: updateData },
      { new: true }
    );

    // Also sync task's assignedTo
    if (currentTaskId) {
      await Task.findOneAndUpdate(
        { Task_Id: currentTaskId },
        { $addToSet: { assignedTo: User_Id } }
      );
    } else {
      await Task.updateMany(
        { assignedTo: User_Id },
        { $pull: { assignedTo: User_Id } }
      );
    }

    res.json({ message: 'Personnel updated successfully', personnel: updatedUser });
  } catch (err) {
    res.status(500).json({ error: 'Error updating personnel', details: err.message });
  }
};


// ✅ 6. Clear a personnel's current task (only if under the sub-admin)
const clearPersonnelTask = async (req, res) => {
  try {
    const { User_Id } = req.params;
    const { subAdminId } = req.body;

    const user = await User.findOne({ User_Id, role: 'personnel' });
    if (!user || user.subAdminId !== subAdminId) {
      return res.status(403).json({ error: 'Unauthorized or personnel not found' });
    }

    const taskId = user.currentTaskId;

    await User.findOneAndUpdate(
      { User_Id },
      { $set: { currentTaskId: null, availability: 'free' } }
    );

    // Also remove user from task's assignedTo
    if (taskId) {
      await Task.findOneAndUpdate(
        { Task_Id: taskId },
        { $pull: { assignedTo: User_Id } }
      );
    }

    res.json({ message: 'Personnel task cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Error clearing task', details: err.message });
  }
};


const getAvailableWeaponsForSubAdmin = async (req, res) => {
  try {
    const { subAdminId } = req.params;

    // Step 1: Get User_Ids of personnel under this sub-admin
    const personnelUnderSubAdmin = await User.find({
      subAdminId,
      role: 'personnel'
    }).select('User_Id');

    const personnelIds = personnelUnderSubAdmin.map((p) => p.User_Id);

    // Step 2: Fetch weapons that are either unassigned or assigned to those personnel
    const weapons = await Weapon.find({
      $or: [
        { assignedTo: null },
        { assignedTo: '' },
        { assignedTo: { $in: personnelIds } }
      ]
    });

    res.json(weapons);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch weapons', details: err.message });
  }
};



const assignWeaponToPersonnel = async (req, res) => {
  try {
    const { weaponId } = req.params;
    const { personnelId, subAdminId } = req.body;

    // Verify that personnel is under this sub-admin
    const personnel = await User.findOne({
      User_Id: personnelId,
      role: 'personnel',
      subAdminId
    });

    if (!personnel) {
      return res.status(403).json({ error: 'Unauthorized or personnel not found' });
    }

    // Update Weapon's assignedTo
    const weapon = await Weapon.findOneAndUpdate(
      { Weapon_Id: weaponId },
      { $set: { assignedTo: personnelId } },
      { new: true }
    );

    if (!weapon) {
      return res.status(404).json({ error: 'Weapon not found' });
    }

    // Add to personnel's weaponsAssigned if not already present
    if (!personnel.weaponsAssigned.includes(weaponId)) {
      personnel.weaponsAssigned.push(weaponId);
      await personnel.save();
    }

    res.json({ message: 'Weapon assigned successfully', weapon });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign weapon', details: err.message });
  }
};

const unassignWeaponFromPersonnel = async (req, res) => {
  try {
    const { weaponId } = req.params;
    const { subAdminId } = req.body;

    const weapon = await Weapon.findOne({ Weapon_Id: weaponId });
    if (!weapon) return res.status(404).json({ error: 'Weapon not found' });

    const personnel = await User.findOne({
      User_Id: weapon.assignedTo,
      role: 'personnel',
      subAdminId
    });

    if (!personnel) {
      return res.status(403).json({ error: 'Not authorized or personnel not found' });
    }

    // Unassign the weapon
    weapon.assignedTo = null;
    await weapon.save();

    // Remove weapon from personnel's array
    personnel.weaponsAssigned = personnel.weaponsAssigned.filter(id => id !== weaponId);
    await personnel.save();

    res.json({ message: 'Weapon unassigned successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error unassigning weapon', details: err.message });
  }
};


module.exports = {
  getMyPersonnel,
  assignTask,
  updateTask,
  deleteTask,
  updatePersonnelStatus,
  clearPersonnelTask,
  fetchTasks,
  getAvailableWeaponsForSubAdmin,
  assignWeaponToPersonnel,
  unassignWeaponFromPersonnel
};
