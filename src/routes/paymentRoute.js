const express = require('express');
const paymentController = require('../controllers/paymentController');
const paymentValidator = require('../middleware/paymentValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();
const multer = require('multer');
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/bannerImages/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + path.extname(file.originalname));
  },
});


const upload = multer({
    storage: storage,
  });

router.post('/setting',paymentValidator.createRequestValidation,paymentController.createPayment);
router.post('/getSetting' ,paymentController.getSetting);
router.delete('/deleteSetting/:id',paymentController.deleteSetting);
router.patch('/updateSetting/:id',paymentController.updateSetting);
router.patch('/updateGoogleAddsSetting/:id',paymentController.updateAdSetting);
router.post('/getGoogleAddsSetting',paymentController.getGoogleAdds);
router.patch('/updateMinimumLimit/:id',upload.single('vedio'),paymentController.updateMimimumLimits);
router.patch('/updatePaymentOption/:id',authMiddleware.verifyAdminToken,paymentController.updatePayment);
router.post('/getAllPayment',authMiddleware.verifyAdminToken,paymentController.getCurrentPaymentOption);
router.post('/getVerificationDetails',authMiddleware.verifyToken,paymentController.getDetailsOfVerification);
router.patch('/updateVerificationDetails/:id',authMiddleware.verifyAdminToken,upload.single('vedio'),paymentController.updateMimimumLimits);
module.exports = router




