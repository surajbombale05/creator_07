const express = require('express');
const serviceModuleController = require('../controllers/serviceModuleController');
// const serviceModuleValidator = require('../middleware/serviceModuleValidation');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();
const multer = require('multer');
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/serviceModuleImages/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + path.extname(file.originalname));
  },
});


const upload = multer({
  storage: storage,
});

router.post('/createServiceModule',authMiddleware.verifyAdminToken, upload.single('image'),serviceModuleController.createServiceModule);
router.post('/getAllServiceModules',authMiddleware.verifyAdminToken, serviceModuleController.getAllServiceModule);
router.post('/getServiceModuleById/:id',authMiddleware.verifyToken, serviceModuleController.getServiceModuleById);
router.delete('/deleteServiceModule/:id',authMiddleware.verifyAdminToken,serviceModuleController.deleteServiceModule);
router.post('/getServiceModuleById',authMiddleware.verifyAdminToken,serviceModuleController.getAllServiceModuleById);
router.patch('/updateServiceModule/:id',authMiddleware.verifyAdminToken,upload.single('image'),serviceModuleController.updateServiceModule);

module.exports = router;
