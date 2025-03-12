const express = require('express');
const trendingTopicController = require('../controllers/trendingTopicController');
const trendingTopicValidator = require('../middleware/trendingTopicValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/trendingTopicImages/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + path.extname(file.originalname));
  },
});


const upload = multer({
  storage: storage,
});


router.post('/createTrendingTopic',authMiddleware.verifyAdminToken,upload.single('image_path'),trendingTopicValidator.createTrendingTopicValidation,trendingTopicController.createTrendingTopic)
router.post('/updateCount',authMiddleware.verifyToken,trendingTopicValidator.updateClickCount,trendingTopicController.countClicks)
router.post('/getAlltrendingTopic',authMiddleware.verifyToken,trendingTopicController.getAllTrendingTopics)
router.post('/gettrendingTopicById/:id',authMiddleware.verifyAdminToken,trendingTopicController.getTrendingTopicsById)
router.patch('/updatetrendingTopic/:id',authMiddleware.verifyAdminToken,upload.single('image_path'),trendingTopicController.updateTrendingTopic)
router.delete('/deletetrendingTopic/:id',authMiddleware.verifyAdminToken,trendingTopicController.deleteTrendingTopic)
router.post('/getHomeData',authMiddleware.verifyToken,trendingTopicController.getAllHomeData)
router.post('/getallTrendingTopicsWithBanner',authMiddleware.verifyToken,trendingTopicController.getAllTrendingTopicAndBanner)
router.post('/updateTrendingTopicStatus',authMiddleware.verifyAdminToken,trendingTopicController.updateTrendingTopicStatus)
router.post('/getAllTrendingTopicViewByUser',authMiddleware.verifyAdminToken,trendingTopicController.getAllViewedByTrendingTopics)
router.post('/updateBannerImage',authMiddleware.verifyAdminToken,upload.single('image_path'),trendingTopicController.updateBannerData)
router.post('/deleteBannerImage',authMiddleware.verifyAdminToken,trendingTopicController.deleteBannerData)
router.post('/getAllTrendingTopicAdmin',authMiddleware.verifyAdminToken,trendingTopicController.getAllTrendingTopicsAdmin)
router.post('/updateSelectedTrendingTopic',authMiddleware.verifyAdminToken,trendingTopicController.updateSelectedTopicStatus)
router.post('/getAllViewedByUser',authMiddleware.verifyAdminToken,trendingTopicController.getAllViewedByTopics)

module.exports = router;