const express = require('express');
const collaboratorRequestController = require('../controllers/collaboratorRequestController');
const collaboratorRequestValidator = require('../middleware/collaboratorRequestValidator');
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();

router.post('/createRequest',authMiddleware.verifyToken,collaboratorRequestValidator.createCollaboratorRequestValidation,collaboratorRequestController.createcollaboratorRequest)
router.patch('/updateCollaboratorRequest/:id',authMiddleware.verifyToken,collaboratorRequestController.updatecollaboratorRequestStatus)
module.exports = router;