const express = require('express');
const feedbackController = require('../controllers/feedbackController');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();

router.post('/createFeedback',authMiddleware.verifyToken,feedbackController.createFeedback);
router.post('/getAllReviewByUserId',authMiddleware.verifyAdminToken,feedbackController.findAllReviewOfAUser);

module.exports = router;