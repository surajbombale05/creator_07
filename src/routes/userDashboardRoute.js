const express = require('express');
const userDashboardController = require('../controllers/userDashboardController');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();

router.post('/getUserDashboardById/:id',authMiddleware.verifyToken,userDashboardController.getUserDashboardByuserId)


module.exports = router;