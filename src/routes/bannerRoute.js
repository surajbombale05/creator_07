const express = require('express');
const bannerController = require('../controllers/bannerController');
const bannerValidator = require('../middleware/bannerValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();
const multer = require('multer');
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/bannerImages/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + path.extname(file.originalname));
  },
});
const fileFilter = (req, file, cb) => {
  // Accept only certain file types, adjust as needed
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});


router.post('/createBanner',upload.single('image_path'),bannerValidator.createBannerValidation,bannerController.createBanner)
router.get('/getAllBanner',bannerController.getAllBanners)
router.get('/getBannerById/:id',bannerController.getBannerById)
router.patch('/updateBanner/:id',upload.single('image_path'),bannerController.updateBanner)
router.delete('/deleteBanner/:id',bannerController.deleteBanner)


module.exports = router;