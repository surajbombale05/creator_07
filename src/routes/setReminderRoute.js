const express = require('express');
const setReminderController = require('../controllers/setReminderController');
const setReminderValidator = require('../middleware/setReminderValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();

router.post('/createReminder',authMiddleware.verifyToken,setReminderValidator.createReminderValidation,setReminderController.createRequest)
router.post('/getAllReminder',setReminderController.getAllReminder)
router.post('/getReminderById',authMiddleware.verifyToken,setReminderController.getAllReminderByUserId)
router.post('/updateReminderAction',authMiddleware.verifyToken,setReminderController.updateReminderAction)
router.delete('/deleteReminder/:id',authMiddleware.verifyToken,setReminderController.deleteReminder)

module.exports = router;

