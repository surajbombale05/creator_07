const express = require('express');
const router = express.Router();
const advertisementController = require('../controllers/advertisment_controller');

router.post('/', advertisementController.uploadFiles, advertisementController.createAdvertisement);
router.post('/get-all', advertisementController.getAllAdvertisements);
router.post('/:id', advertisementController.getAdvertisementById);
router.put('/:id', advertisementController.uploadFiles, advertisementController.updateAdvertisement);
router.delete('/:id', advertisementController.deleteAdvertisement);

module.exports = router;
