const express = require('express');
const transcationController = require('../controllers/transactionController');
const transactionValidator = require('../middleware/transactionValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();


router.post('/createTransaction',authMiddleware.verifyToken,transactionValidator.createTransaction,transcationController.createPayment)
router.post('/createServicePayment',authMiddleware.verifyToken,transcationController.createServicePayment)
router.post('/getTransactionByUserId',authMiddleware.verifyAdminToken,transcationController.getTransactionByRequestId)
router.post('/getLiveServiceOfUser',authMiddleware.verifyToken,transcationController.getLiveServiceOfUser);
router.post('/getAllUserService',authMiddleware.verifyAdminToken,transcationController.getAllUserServices);
router.post('/updateUserService',authMiddleware.verifyAdminToken,transcationController.updateServiceStatus);
module.exports = router;