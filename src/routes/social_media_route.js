const express = require('express');
const router = express.Router();
const socialMediaController = require('../controllers/social_media_controller');

// Multer middleware for file uploads
const upload = require('../middleware/upload');
const uploadFiles = upload.fields([{ name: 'icon', maxCount: 1 }]);

router.post('/', uploadFiles, socialMediaController.createSocialMedia);
router.post('/get-all', socialMediaController.getAllSocialMedia);
router.post('/:id', socialMediaController.getSocialMediaById);
router.put('/:id', uploadFiles, socialMediaController.updateSocialMedia);
router.delete('/:id', socialMediaController.deleteSocialMedia);

module.exports = router;