const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// User routes
router.post('/user', adminController.addUser);
router.put('/user/:User_Id', adminController.updateUser);
router.delete('/user/:User_Id', adminController.deleteUser);
router.get('/user', adminController.getUsers);

// Weapon routes
router.post('/weapon', adminController.addWeapon);
router.put('/weapon/:Weapon_Id', adminController.updateWeapon);
router.delete('/weapon/:Weapon_Id', adminController.deleteWeapon);
router.get('/weapon', adminController.getWeapons);

router.get('/personnel', adminController.getPersonnel); // Get all available weapons

// Task routes
router.post('/task', adminController.addTask);
router.put('/task/:Task_Id', adminController.updateTask);
router.delete('/task/:Task_Id', adminController.deleteTask);
router.get('/task', adminController.getAllTasks);
router.get('/free', adminController.getFreePersonnel); // Get all free personnel

module.exports = router;
