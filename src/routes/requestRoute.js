const express = require('express');
const requestController = require('../controllers/requestController');
const requestValidator = require('../middleware/requestVaditator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();


router.post('/createRequest',authMiddleware.verifyToken,requestValidator.createRequestValidation,requestController.createRequest)
router.post('/canRequest',authMiddleware.verifyToken,requestValidator.canRequestValidation,requestController.canRequest)
router.get('/getAllRequest',requestController.getAllRequest)
router.get('/getRequestById/:id',requestController.getRequestById)
router.post('/getRequestBycreatorId/:id',authMiddleware.verifyToken,requestController.getRequestByuserIdId)
router.patch('/updateRequest/:id',authMiddleware.verifyToken,requestController.updateRequestStatus)
router.delete('/deleteRequest/:id',requestController.deleteRequest);
router.post('/getAllPendingWork',authMiddleware.verifyToken,requestController.getAllPendingRequets);
router.post('/getAllCompleteWork',authMiddleware.verifyToken,requestController.getAllCompleteRequets);
router.patch('/updateRequestStatus/:id',authMiddleware.verifyToken,requestController.updateWorkStatus)


module.exports = router;