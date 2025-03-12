const express = require('express');
const searchController = require('../controllers/searchController');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();


router.post('/search',authMiddleware.verifyToken,searchController.getAllSearch);

module.exports = router;