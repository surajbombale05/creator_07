const express = require('express');
const topicController = require('../controllers/topicsController');
const topicValidator = require('../middleware/topicsValidation');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const router = express.Router();
const path = require('path');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/topicsImages/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.post('/createTopic',authMiddleware.verifyAdminToken,upload.single("image_path"),topicController.createTopics);
router.post('/getAllTopics',authMiddleware.verifyToken,topicController.getAllTopics);
router.get('/getTopicById/:id', authMiddleware.verifyAdminToken, topicController.getTopicById);
router.patch('/updateTopicById/:id',authMiddleware.verifyAdminToken, upload.single("image_path"),topicController.updateTopic);
router.delete('/deleteTopicById/:id',authMiddleware.verifyAdminToken, topicController.deleteTopic);
router.post('/updateTopicStatus',authMiddleware.verifyAdminToken,topicController.updateTopicStatus);
router.post('/getAllTopicsAdmin',authMiddleware.verifyAdminToken,topicController.getAllTopicsAdmin);
router.post('/getAllViewedByUser',authMiddleware.verifyAdminToken,topicController.getAllViewedByTopics);
router.post('/updateBannerImageTopic',authMiddleware.verifyAdminToken,upload.single("image_path"),topicController.updateBannerData);
router.post('/deleteTopicBanner',authMiddleware.verifyAdminToken,topicController.deleteBannerData);
router.post('/updateTopicSelectedStatus',authMiddleware.verifyAdminToken,topicController.updateSelectedTopicsStatus);

module.exports = router;
