const express = require('express');
const subCategoryController = require('../controllers/subCategoryController');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();


router.post('/createSubCategory',authMiddleware.verifyAdminToken,subCategoryController.createSubCategory)
router.post('/getAllSubCategory',authMiddleware.verifyToken,subCategoryController.getAllsubCategory);
router.post('/getAllSubCategoryAdmin',authMiddleware.verifyAdminToken,subCategoryController.getAllsubCategory);
router.delete('/deleteSubCategory/:id',authMiddleware.verifyAdminToken,subCategoryController.deleteSubCategoryById);

module.exports = router