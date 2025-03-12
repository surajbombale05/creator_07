const express = require('express');
const savedCategoryController = require('../controllers/savedCategoryController');
const savedTopicValidator = require('../middleware/savedTopicsValidator');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/createSavedCategory',authMiddleware.verifyToken,savedCategoryController.createSavedCategory);
router.post('/getsavedCategoryByUserId',authMiddleware.verifyToken,savedCategoryController.findSavedCategory);

module.exports = router;