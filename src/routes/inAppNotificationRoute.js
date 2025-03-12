const express = require('express');
const isAppNotificationController = require('../controllers/inAppNotificationController');
const isAppNotificationValidator = require('../middleware/inAppNotificationValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();
const multer = require('multer');
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/notificationImages/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + path.extname(file.originalname));
  },
});


const upload = multer({
  storage: storage,
});


router.get('/getDashboardData',isAppNotificationController.getDashBoardDetails);
router.post('/createInAppNotification',isAppNotificationValidator.createInAppNotificationValidation,isAppNotificationController.createInAppNotification);
router.post('/getNotificationByUserId',authMiddleware.verifyToken,isAppNotificationController.getNotificationByUserId);
router.patch('/updateInAppNotification/:id',isAppNotificationController.updateInAppNotification);
router.patch('/updateInAppNotificationNew/:id',authMiddleware.verifyAdminToken,upload.single('image_path'),isAppNotificationValidator.updateInAppNotificationValidation,isAppNotificationController.updateInAppNotificationNew);
router.delete('/deleteInAppNotification/:id',authMiddleware.verifyAdminToken,isAppNotificationController.deleteInAppNotification)
router.delete('/deleteInAppNotificationWithMessageId/:id/:userid',authMiddleware.verifyAdminToken,isAppNotificationController.deleteInAppNotificationWithMessageId)
router.post('/getReviewNotification',authMiddleware.verifyToken,isAppNotificationController.getAllReviewInappNotification);
router.post('/sendInAppNotificationToUser',authMiddleware.verifyAdminToken,upload.single('image_path'),isAppNotificationController.createInAppNotificationForSingleUser);
router.post('/sendTempleteNotification',isAppNotificationValidator.validateTempleteNotification,isAppNotificationController.sendTempleteNotification);
router.post('/createFcmNotification',authMiddleware.verifyAdminToken,upload.single('image_path'),isAppNotificationValidator.validateFcmNotification,isAppNotificationController.createFcmNotification);
router.post('/createFcmNotificationForSingleUser',authMiddleware.verifyAdminToken,upload.single('image_path'),isAppNotificationController.createFcmNotificationForSingleUser);
router.post('/updateNotificationCount',authMiddleware.verifyToken,isAppNotificationController.AddNotificationCount);
router.post('/getAllNotififation',authMiddleware.verifyAdminToken,isAppNotificationController.getAllNotificationData);
router.post('/getAllNotificationCount',authMiddleware.verifyAdminToken,isAppNotificationController.getNotificationDashboard);
router.post('/getAllViewedByUser',authMiddleware.verifyAdminToken,isAppNotificationController.getAllViewedByTopics);

module.exports = router;