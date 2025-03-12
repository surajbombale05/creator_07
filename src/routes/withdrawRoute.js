
const express = require('express');
const winningRateController = require('../controllers/withdrawRequestController');
const winningRateValidator = require('../middleware/withdrawValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();

router.post('/createWithdrawRequest',authMiddleware.verifyToken, winningRateValidator.validateWithdrawRequestCreation, winningRateController.createWithdrawRequest);
router.post('/getAllWinningRates', winningRateController.getAllWithdrawRequest);
router.delete('/deleteWinningRate/:id', winningRateController.deleteWithdrawRequest);
router.patch('/updateWinningRate/:id',authMiddleware.verifyAdminToken,winningRateController.updateWithdrawRequestStatus);
router.post('/getAllWithdrawRequestByUserId',authMiddleware.verifyAdminToken,winningRateController.getWithdrawRequestByUserId);

module.exports = router
