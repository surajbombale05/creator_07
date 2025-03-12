const express = require('express');
const notificationController = require('../controllers/notificationController');
const notificationValidator = require('../middleware/notificationValidator');
const authMiddleware = require('../middleware/authMiddleware')
const multer = require('multer');
const router = express.Router();
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



router.post('/getAllNotification/:id',authMiddleware.verifyToken,notificationController.getNotificationByuserId)
router.post('/createUserNotification',authMiddleware.verifyAdminToken,upload.single('image_path'),notificationController.sendNotificationToUser);
router.post('/createInAppNotification',authMiddleware.verifyAdminToken,upload.single('image_path'),notificationController.userInAppNotification);
router.post('/getInAppNotificationForToday',authMiddleware.verifyToken,notificationController.getInAppNotificationByUserId)

module.exports = router