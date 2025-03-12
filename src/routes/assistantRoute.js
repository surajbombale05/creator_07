const express = require('express');
const openAiController = require('../controllers/assistantController');
const openAiValidator = require('../middleware/assistantValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();


router.post('/createChat',openAiValidator.createOpenAiDataValidation,openAiController.createAssistantResponse)
router.post('/getAllChat/:id',authMiddleware.verifyToken,openAiController.getChatResponseByUserId)
module.exports = router;