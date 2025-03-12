const express = require('express');
const router = express.Router();
const videoController = require('../controllers/video_controller');

router.post('/',videoController.uploadFiles,videoController.createVideo);
router.post('/get-all',videoController.getAllVideos);
router.post('/:id',videoController.getVideoById);
router.put('/:id',videoController.uploadFiles,videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);

module.exports = router;
