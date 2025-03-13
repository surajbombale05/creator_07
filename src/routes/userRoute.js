const express = require('express');
const userController = require('../controllers/userController');
const userMiddleware = require('../middleware/userValidation');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();
const multer = require('multer');
const path = require("path");
// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    cb(null, './public/profileImages/');
  },
  filename: function (req, file, cb) {

    cb(null, Date.now() + '-' + path.extname(file.originalname));
  },
});


const upload = multer({ storage: storage });



router.post('/getAllUsers',authMiddleware.verifyAdminToken,userController.getAllUsers);
router.post('/getAllUserAsCreator',userController.getAllUserAsCreator);
router.post('/getuserbyId',authMiddleware.verifyToken,userController.getUserById);
router.post('/getUserProfile',authMiddleware.verifyToken,userController.getUserProfile);
router.get('/getFilterUser',userController.filterUsers);
router.post('/getAllColaborators',authMiddleware.verifyToken,userController.getAllCollaborators)
router.get('/getCreatorById/:id',userController.getCreatorById)
router.post('/registerUser',userMiddleware.createUserValidation, userController.createUser);
router.post('/login',userMiddleware.LoginUserValidation, userController.login);
router.post('/sendForgotPassword',authMiddleware.verifyToken,userController.forgetPassword);
router.patch('/updateUser/:id',authMiddleware.verifyToken,userController.updateUser);
router.patch(
  '/updateProfile/:id',authMiddleware.verifyToken,
  upload.fields([{ name: 'profile_image', maxCount: 1 }, { name: 'work_image', maxCount: 1 }]),
  userController.updateProfile
);
router.patch('/updateCreator/:id',authMiddleware.verifyToken,userMiddleware.updateIsCreator,userController.updateIsCreator)
router.patch('/updateColaborator/:id',authMiddleware.verifyToken,userMiddleware.updateIsCollaborator,userController.updateIsCollaborator);
router.patch('/updateColaboratorDetails/:id',authMiddleware.verifyToken,upload.single('image'),userMiddleware.updateCollaborator,userController.updateCollaborator)
router.delete('/deleteUser/:id', authMiddleware.verifyToken,userController.deleteUser);
router.patch('/updateUserStatus/:id',authMiddleware.verifyAdminToken,userController.updateUserStatus)
router.post('/searchUser',authMiddleware.verifyAdminToken,userController.getAllCount)
router.post('/getAllUserAction',authMiddleware.verifyAdminToken,userController.getUsersActionById)
router.patch('/updateCreatorAdmin/:id',authMiddleware.verifyAdminToken,userMiddleware.updateIsCreator,userController.updateIsCreator)
router.patch('/updateColaboratorAdmin/:id',authMiddleware.verifyAdminToken,userMiddleware.updateIsCollaborator,userController.updateIsCollaborator);
router.patch('/updateShowBanner/:id',authMiddleware.verifyAdminToken,userController.updateshowBanner)
router.post('/getGoogleBannerOfUser',authMiddleware.verifyToken,userController.getGoogleBannersByUserId)
router.post('/addCreatorViews',authMiddleware.verifyToken,userController.addViews);
router.post('/getAllUserReports',authMiddleware.verifyAdminToken,userController.getAllUserCountDashboard )
router.patch(
  '/updateProfileCreatorAdmin/:id',authMiddleware.verifyAdminToken,
  upload.fields([{ name: 'profile_image', maxCount: 1 }, { name: 'work_image', maxCount: 1 }]),
  userController.updateProfile
);
router.patch('/updateColaboratorDetailsAdmin/:id',authMiddleware.verifyAdminToken,upload.single('image'),userMiddleware.updateCollaborator,userController.updateCollaborator);
router.post('/updateVerificationStatus',authMiddleware.verifyToken,userController.createVerification);
router.post('/createUserAdmin',authMiddleware.verifyAdminToken,userController.createUserAdmin);
router.post('/getAllVerification',authMiddleware.verifyAdminToken,userController.getAllUserVerification);
router.post('/getAllUserVerficationCount',authMiddleware.verifyAdminToken,userController.getChartOfVerifiedUser);
router.post('/updateUserVerificationStatus',authMiddleware.verifyAdminToken,userController.updateVerificationRequest);
router.post('/selectCreator',authMiddleware.verifyAdminToken,userController.selectCreator);

module.exports = router;