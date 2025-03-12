const express = require('express');
const youtubeUpdateController = require('../controllers/youtubeUpdatesController');
const youtubeUpdateValidator = require('../middleware/youtubeUpdatesValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();
const multer = require('multer');
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/youtubeUpdateImages/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });


router.post('/createyoutubeUpdates',authMiddleware.verifyAdminToken,upload.single('image_path'),youtubeUpdateValidator.createYoutubeUpdatesValidation,youtubeUpdateController.createYoutubeUpdates)
router.post('/getAllyoutubeUpdates',authMiddleware.verifyToken,youtubeUpdateController.getAllYoutubeUpdates)
router.post('/getyoutubeUpdates',authMiddleware.verifyAdminToken,youtubeUpdateController.getYoutubeUpdateById)
router.patch('/updateyoutubeUpdates/:id',authMiddleware.verifyAdminToken,upload.single('image_path'),youtubeUpdateController.updateYoutubeUpdate)
router.delete('/deleteyoutubeUpdates/:id',authMiddleware.verifyAdminToken,youtubeUpdateController.deleteYoutubeUpdate)
router.post('/updateyoutubeUpdatesStatus',authMiddleware.verifyAdminToken,youtubeUpdateController.updateYoutubeUpdateStatus)
router.post('/getAllyoutubeUpdatesAdmin',authMiddleware.verifyAdminToken,youtubeUpdateController.getAllYoutubeUpdatesByAdmin)
router.post('/getAllSocailUpdateViewedByUser',authMiddleware.verifyAdminToken,youtubeUpdateController.getAllViewedBySocailUpdates)
router.post('/updateBannerImage',authMiddleware.verifyAdminToken,upload.single('image_path'),youtubeUpdateController.updateBannerData)
router.post('/deleteBannerImage',authMiddleware.verifyAdminToken,youtubeUpdateController.deleteBannerData);
router.post('/updateSelectedYoutubeUpdateStatus',authMiddleware.verifyAdminToken,youtubeUpdateController.updateSelectedSocailUpdateStatus)
router.post('/getAllViewedByUser',authMiddleware.verifyAdminToken,youtubeUpdateController.getAllViewedBySocialUpdates);

module.exports = router;