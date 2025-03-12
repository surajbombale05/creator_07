
const express = require('express');
const router = express.Router();
const userRoutes = require('./src/routes/userRoute');
const dashboardRoutes = require('./src/routes/dashboardRoute')
const topicsRoutes = require('./src/routes/topicsRouter')
const bannerRoute = require('./src/routes/bannerRoute')
const youtubeUpdatesRoute = require('./src/routes/youtubeUpdatesRoute')
const trendingTopic = require('./src/routes/trendingTopicRoute')
const userDashboard = require('./src/routes/userDashboardRoute');
const service = require('./src/routes/serviceRoute');
const serviceModule = require('./src/routes/serviceModuleRoute');
const requestRoute = require('./src/routes/requestRoute');
const savedTopic = require('./src/routes/savedTopicRoute');
const notification = require('./src/routes/notificationRoute');
const tags = require('./src/routes/tagsRoute');
const payment = require('./src/routes/paymentRoute');
const reminder = require('./src/routes/setReminderRoute');
const search = require('./src/routes/searchRoute');
const category = require('./src/routes/categoriesRoute');
const collaborator = require('./src/routes/collaboratorRequestRoute');
const inAppNotification = require('./src/routes/inAppNotificationRoute')
const transaction = require('./src/routes/transactionRoute');
const assistant = require('./src/routes/assistantRoute');
const admin = require('./src/routes/adminRoute');
const bankDetails = require('./src/routes/bankDetailsRoute');
const withdrawRequest = require('./src/routes/withdrawRoute');
const subcategories = require('./src/routes/subCategoryRoute');
const savedCategory = require('./src/routes/savedCategoryRoute');
const feedback = require('./src/routes/feedbackRoute');
const ticker = require('./src/routes/ticker_route');
const video = require('./src/routes/video_routes');
const advertisement = require('./src/routes/advertisement_route');
const socialMedia = require('./src/routes/social_media_route');
const skillpay = require('./src/routes/skillpay_paymnet_route');
const razorpay = require('./src/routes/razorpay_order_route');
router.use('/user', userRoutes);
router.use('/dashboard',dashboardRoutes);
router.use('/topics',topicsRoutes);
router.use('/banner',bannerRoute);
router.use('/youtubeUpdates',youtubeUpdatesRoute);
router.use('/trendingTopic',trendingTopic);
router.use('/userDashboard',userDashboard);
router.use('/service',service);
router.use('/serviceModule',serviceModule);
router.use('/request',requestRoute);
router.use('/savedTopic',savedTopic);
router.use('/notification',notification);
router.use('/tags',tags);
router.use('/payment',payment);
router.use('/setReminder',reminder);
router.use('/search',search);
router.use('/category',category);
router.use('/collaborator',collaborator);
router.use('/inAppNotification',inAppNotification);
router.use('/transaction',transaction);
router.use('/assistant',assistant);
router.use('/admin',admin);
router.use('/bankDetails',bankDetails);
router.use('/withdrawRequest',withdrawRequest);
router.use('/subcategories',subcategories);
router.use('/savedCategory',savedCategory);
router.use('/feedback',feedback);
router.use('/ticker',ticker);
router.use('/video',video);
router.use('/advertisement',advertisement);
router.use('/social-media',socialMedia);
router.use('/skillpay',skillpay);
router.use('/razorpay',razorpay);
module.exports = router;
