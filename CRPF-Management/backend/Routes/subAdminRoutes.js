const express = require('express');
const router = express.Router();
const subAdminController = require('../controllers/subadminController');

// 👥 Personnel Routes
router.get('/personnel/:subAdminId', subAdminController.getMyPersonnel);
router.put('/personnel/:User_Id/update', subAdminController.updatePersonnelStatus);
router.put('/personnel/:User_Id/clear-task', subAdminController.clearPersonnelTask);

// ✅ Task Management
router.post('/task', subAdminController.assignTask);
router.put('/task/:Task_Id', subAdminController.updateTask);
router.delete('/task/:Task_Id', subAdminController.deleteTask);
router.get('/tasks/:subAdminId', subAdminController.fetchTasks);

// 🔫 Weapon Management (NEW)
router.get('/weapon/:subAdminId/available', subAdminController.getAvailableWeaponsForSubAdmin);
router.post('/weapon/:weaponId/assign', subAdminController.assignWeaponToPersonnel);
router.put('/weapon/:weaponId/unassign', subAdminController.unassignWeaponFromPersonnel);

module.exports = router;
