const express = require('express');
const adminController = require('../controllers/adminController');
const adminValidator = require('../middleware/adminValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/profileImages/');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + path.extname(file.originalname));
    },
  });

const upload = multer({ storage: storage });


router.post('/createAdmin',adminValidator.validateCreateAdmin,adminController.createAdmin);
router.post('/login',adminController.adminLogin);
router.post('/getAllTeamMembers',authMiddleware.verifyAdminToken,adminController.getAllTeamMember);
router.patch('/updateTeamMember/:id',authMiddleware.verifyAdminToken,upload.single('image_path'),adminController.updateTeamMember);
router.delete('/deleteTeamMember/:id',authMiddleware.verifyAdminToken,adminController.deleteTeamMember);
router.post('/forgetPassword',authMiddleware.verifyAdminToken,adminController.forgetPassword);
router.patch('/updateUserStatus/:id',authMiddleware.verifyAdminToken,adminController.updateStatusOfTeamMember)
router.patch('/updateAdmin/:id',authMiddleware.verifyAdminToken,upload.single('image_path'),adminController.updateAdmin)
module.exports = router