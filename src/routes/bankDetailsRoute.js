const express = require('express');
const bankDetailsController = require('../controllers/bankDetailsController');
// const bankDetailsValidator = require('../Validator/bankDetailsValidator');
const Middleware = require('../middleware/authMiddleware');
const router = express.Router();


router.post('/createBankDetails',Middleware.verifyToken,bankDetailsController.createBankDetails);
router.post('/getAllBankDetails',Middleware.verifyToken, bankDetailsController.getBankDetailsByUserId);
router.patch('/updateBankDetails/:id',bankDetailsController.updateBankDetails);
module.exports = router