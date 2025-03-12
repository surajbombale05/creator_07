const express = require('express');
const tagsController = require('../controllers/tagsController');
const tagsValidator = require('../middleware/tagsValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();

router.post('/createTags',tagsValidator.createRequestValidation,tagsController.createTags)
router.post('/getAllTags',authMiddleware.verifyToken,tagsController.findTagsByTag)
module.exports = router