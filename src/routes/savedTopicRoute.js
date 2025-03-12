const express = require('express');
const savedtopicController = require('../controllers/savedTopicController');
const savedTopicValidator = require('../middleware/savedTopicsValidator');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/createSavedTopic',authMiddleware.verifyToken,savedTopicValidator.createSavedTopicValidation,savedtopicController.createOrUpdateSavedTopic)
router.post('/getSavedTopicByUserId/:id',authMiddleware.verifyToken,savedtopicController.getSavedTopicsByUserId)
module.exports = router;