const express = require('express');
const serviceController = require('../controllers/serviceController');
const serviceValidator = require('../middleware/serviceValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();
const multer = require('multer');
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/servicesImages/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });



router.post('/createService',upload.single('image_path'),serviceValidator.createServiceValidation,serviceController.createService)
router.post('/getAllService',serviceController.getAllServices)
router.get('/getServiceById/:id',serviceController.getServiceById)
router.patch('/updateService/:id',upload.single('image_path'),serviceController.updateService)
router.delete('/deleteService/:id',serviceController.deleteService)
router.post('/getAllActiveServices',authMiddleware.verifyToken,serviceController.getAllActiveServices);
router.post('/getAllSeviceCount',authMiddleware.verifyAdminToken,serviceController.getAllServiceData);
router.post('/getAllSeviceUserReport',authMiddleware.verifyAdminToken,serviceController.getAllUserServiceDetails);


module.exports = router;