const express = require('express');
const dashController = require('../controllers/dashboardController');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')

router.post('/getAllActiveUsers',dashController.getActiveUsers);
router.post('/getAllUsers',dashController.getAllUsers);
router.post('/getAllCount',authMiddleware.verifyAdminToken,dashController.getCountsofTopics);
router.post('/getDasboardOfUser',authMiddleware.verifyToken,dashController.getUserDashBoardDetails);
router.post('/getEachContentResponse',authMiddleware.verifyAdminToken,dashController.gettopicTrendingSocialStatusData);
router.post('/getUserDashboardAdmin',authMiddleware.verifyAdminToken,dashController.getUserDashBoardDetailsByAdmin);
router.post('/getServiceDashboardAdmin',authMiddleware.verifyAdminToken,dashController.getServiceDashboardAdmin);
router.post('/getWithdrawDashboardAdmin',authMiddleware.verifyAdminToken,dashController.getWithdrawalDashboardAdmin);
router.post('/getRevenueDashboardAdmin',authMiddleware.verifyAdminToken,dashController.getRevenueDashboardAdmin);
router.post('/getPostsDashboardAdmin',authMiddleware.verifyAdminToken,dashController.getPostsDashboardAdmin);
router.post('/getAllRevenue',authMiddleware.verifyAdminToken,dashController.getRevenue);
router.post('/getPercentageServiceReport',authMiddleware.verifyAdminToken,dashController.getPercentageSaleOfService);
router.post('/deleteData',authMiddleware.verifyAdminToken,dashController.deleteByIdOrAll);
router.post('/getBarchartRevenue',authMiddleware.verifyAdminToken,dashController.getBarchartRevenue);
router.post('/getAllUserServiceRevenue',authMiddleware.verifyAdminToken,dashController.getAllUserServiceData);


module.exports = router;
