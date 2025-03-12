const express = require('express');
const collaboratorController = require('../controllers/categoriesController');
const collaboratorValidator = require('../middleware/categoriesValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();


router.post('/createCategory',authMiddleware.verifyAdminToken,collaboratorValidator.createCategory,collaboratorController.createCategory)
router.post('/getAllCategory',authMiddleware.verifyToken,collaboratorController.getAllCategory);
router.post('/getAllCategoryAdmin',authMiddleware.verifyAdminToken,collaboratorController.getAllCategory);
router.delete('/deleteCategory/:id',authMiddleware.verifyAdminToken,collaboratorController.deleteCategory);
module.exports = router