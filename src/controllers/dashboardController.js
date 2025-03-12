const User = require('../models/userModel');
const Dashboard = require('../models/dashboardModel');
const category = require('../models/categoriesModel');
const subcategories = require('../models/subCategoryModel');
const {formatTimeToIST,getMonthlyDateRanges,getMonthName} = require('../../utils/dateUtils');
const topic = require('../models/topicsModel');
const youtubeUpdate = require('../models/youtubeUpdatesModel');
const TrendingTopic = require('../models/trendingTopicModel');
const Admin = require('../models/adminModel');
const Service = require('../models/serviceModel');
const Withdraw = require('../models/withdrawModel');
const userService = require('../models/userServiceModel');
const moment = require('moment-timezone');

// API endpoint to get active users
exports.getActiveUsers = async (req, res) => {
    try {
        const activeUsers = await Dashboard.getActiveUsers();
        return res.status(200).json({ msg:'active user list',count:activeUsers.length,data:activeUsers});
    } catch (error) {
        console.error('Error getting active users:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.findAllUsers()
      return res.json({msg:'total user list',count:users.length,data:users});
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
};


exports.getCountsofTopics = async (req, res) => {
  const {type} = req.body;
  try {
    const findAllCategory = await category.getCategories();
    const findAllSubCategories = await subcategories.getAllSubCategories();
    let result = null;
    if(type==='topics'){
      const findAllTopics = await topic.findAllTopicMetaData();
    result = {
      status: true,
      message: 'Topic data found successfully',
      categories: findAllCategory.length,
      subCategories: findAllSubCategories.length,
      totalTopics: findAllTopics.totalTopics,
      approved: findAllTopics.acceptedTopics,
      pending: findAllTopics.pendingTopics,
      rejected: findAllTopics.rejectedTopics
    }
  }
    if(type==='socailUpdates'){
      const findSocialUpdates = await youtubeUpdate.findAllYoutubeUpdatesMetaData();
      result = {
        status: true,
        message: 'Social Update found successfully',
        totalSocialUpdates: findSocialUpdates.totalYoutubeUpdates,
        approved: findSocialUpdates.acceptedYoutubeUpdates,
        pending: findSocialUpdates.pendingYoutubeUpdates,
        rejected: findSocialUpdates.rejectedYoutubeUpdates
      }
    }

    if(type==='trendingTopics'){
      const findAllTrendingTopics = await TrendingTopic.findAllTrendingTopicsMetadata();
      result = {
        status: true,
        message: 'Trending Topic found successfully',
        totalTrendingTopics: findAllTrendingTopics.totalTrendingTopics,
        pending: findAllTrendingTopics.pendingTrendingTopics,
        accepted: findAllTrendingTopics.acceptedTrendingTopics,
        rejected: findAllTrendingTopics.rejectedTrendingTopics
    }
  }
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


exports.getUserDashBoardDetails = async (req, res) => {
  const { userId } = req.body;
  try {
    const todayDate = formatTimeToIST().format('YYYY-MM-DD');
    const yesterdayDate = formatTimeToIST().subtract(1, 'days').format('YYYY-MM-DD');
    const yestardyMonthDate = formatTimeToIST().subtract(1, 'months').format('YYYY-MM-DD');
    const findTodaysRevenue = await Dashboard.TodaysRevenue(userId,todayDate);
    const findYesterdayRevenue = await Dashboard.TodaysRevenue(userId,yesterdayDate);
    const thisMonthRevenue = await Dashboard.MonthlyRevenue(userId, todayDate);
    const lastMonthRevenue = await Dashboard.MonthlyRevenue(userId, yestardyMonthDate);
    const lifeTimeRevenue = await Dashboard.lifetimeRevenue(userId);
    const findUser = await User.findUserById(userId);
    const dashboardDetails = {
       todayRevenue: findTodaysRevenue,
       yesterdayRevenue: findYesterdayRevenue,
       thisMonthRevenue: thisMonthRevenue,
       lastMonthRevenue: lastMonthRevenue,
       lifetimeRevenue: lifeTimeRevenue,
       pendingWork : findUser.pendingWork,
       completedWork : findUser.completeWork,
       views: findUser.views
    }
    return res.json({ msg: 'Dashboard details of user', data: dashboardDetails });
  } catch (error) {
    console.error('Error getting dashboard details:', error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}



exports.gettopicTrendingSocialStatusData = async(req, res) => {
  const {type, status , teamId} = req.body;
  try {
    let mySttaus = null;
    if(status === '1'){
      mySttaus = 'accepted';
    }else if(status === '0'){
      mySttaus = 'pending';
    }else if(status === '-1'){
      mySttaus = 'rejected';
    }
    const findTeamMember = await Admin.findAdminById(teamId);
    if(!findTeamMember) {
      return res.status(404).json({ errors: ['Team member not found'] });
    }
    if(findTeamMember.type === 'admin') {
      const findAdminData  = await Dashboard.getTopicTrendingSocialDataAdmin(type, status);
      return res.status(200).json({status: true, message: `${mySttaus} data found successfully`, data: findAdminData});
    }
    const result = await Dashboard.getTopicTrendingSocialData(type, status, teamId);
    return res.status(200).json({status: true, message: `${mySttaus} data found successfully`, data: result});
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


exports.getUserDashBoardDetailsByAdmin = async (req, res) => {
  try{
    const yesterdayDate = formatTimeToIST().subtract(1, 'days').format('YYYY-MM-DD');
    const todayDate = formatTimeToIST().format('YYYY-MM-DD');
    const totalUser = await User.findAllUsers('all',null,null,'');
    const totalActiveUser = await Dashboard.getActiveUsers();
    const yestardayRegisteredUser = await Dashboard.getAllYestardayRegisteredUsers(yesterdayDate);
    const todayRegisteredUser = await Dashboard.getAllYestardayRegisteredUsers(todayDate);
    const totalPaidUser = await Dashboard.paidUsers();
    const totalLiveUser = await Dashboard.countLiveUsers();
    const data = {
      totalUser: totalUser.length,
      totalActiveUser: totalActiveUser.length,
      totalInActiveUser: totalUser.length - totalActiveUser.length,
      totalLiveUser: totalLiveUser,
      totalPaidUser: totalPaidUser.length,
      totalUnPaidUser: totalUser.length - totalPaidUser.length,
      todayRegisteredUser: todayRegisteredUser.length,
      yestardayRegisteredUser: yestardayRegisteredUser.length
    }
    return res.json({ msg: 'Dashboard details of user', data: data });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}




exports.getServiceDashboardAdmin = async (req, res) => {
  try{
    const getAllServices = await Service.findAllServices();
    const getAllActiveServices = await Service.getAllActiveServices();
    const data = {
      totalService: getAllServices.length,
      totalActiveService: getAllActiveServices.length,
      totalInActiveServices: getAllServices.length - getAllActiveServices.length
    }
    return res.json({ msg: 'Dashboard details of service', data: data });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}



exports.getWithdrawalDashboardAdmin = async (req, res) => {
  try{
    const yesterdayDate = formatTimeToIST().subtract(1, 'days').format('YYYY-MM-DD');
    const todayDate = formatTimeToIST().format('YYYY-MM-DD');
    const getAllWithdrawal = await Dashboard.getAllPendindWithdrawals(yesterdayDate, todayDate);
    const data = {
      totalPendingAmount: parseInt(getAllWithdrawal.totalPendingAmount,10),
      totalPaidAmount: parseInt(getAllWithdrawal.totalPaidAmount),
      yesterdayPaidAmount: parseInt(getAllWithdrawal.yesterdaysPaidAmount,10),
      todayPaidAmount: parseInt(getAllWithdrawal.todaysPaidAmount,10)
    }
    return res.json({ msg: 'Dashboard details of withdrawal', data: data });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}

exports.getRevenueDashboardAdmin = async (req, res) => {
  try{
    const yesterdayDate = formatTimeToIST().subtract(1, 'days').format('YYYY-MM-DD');
    const todayDate = formatTimeToIST().format('YYYY-MM-DD');
    const revenueData = await Dashboard.getAllRevenue(yesterdayDate, todayDate);
    const result = {
      totalRevenue: parseInt(revenueData.totalRevenueData,10),
      yesterdayRevenue: parseInt(revenueData.yesterdaysRevenue,10),
      todayRevenue: parseInt(revenueData.todaysRevenue,10)
    }
    return res.json({ msg: 'Dashboard details of revenue', data: result });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}



exports.getPostsDashboardAdmin = async (req, res) => {
  try{
    const getAllPosts = await Dashboard.postCount();
    const data = {
      totalTopics: getAllPosts.totalPost,
      totalSocailUpdates: getAllPosts.totalSocialPost
    }
    return res.json({ msg: 'Dashboard details of posts', data: data });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}



exports.getRevenue = async (req, res) => {
  try{
    const date = formatTimeToIST().subtract(1, 'days').format('YYYY-MM-DD');
    const startOfthisMonth = formatTimeToIST().startOf('month').format('YYYY-MM-DD');
    const endOfthisMonth = formatTimeToIST().endOf('month').format('YYYY-MM-DD');
    const startDateOfYear = formatTimeToIST().startOf('year').format('YYYY-MM-DD');
    const endDateOfYear = formatTimeToIST().endOf('year').format('YYYY-MM-DD');
    const revenueData = await Dashboard.getRevenue(formatTimeToIST().format('YYYY-MM-DD'), date, startOfthisMonth, endOfthisMonth, startDateOfYear, endDateOfYear);
    return res.json({ msg: 'Dashboard details of revenue', data: revenueData });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


exports.getPercentageSaleOfService = async (req, res) => {
  try{
    const percentageSale = await userService.findAllUserServices();
    const thumnailService = percentageSale.filter((item) => item.serviceId === 3);
    const contentWriting = percentageSale.filter((item) => item.serviceId === 1);
    const videoEditing = percentageSale.filter((item) => item.serviceId === 2);
    let data = {
      thumnailService: `${thumnailService.length/percentageSale.length*100}%`,
      contentWriting: `${contentWriting.length/percentageSale.length*100}%`,
      videoEditing: `${videoEditing.length/percentageSale.length*100}%`
    }
    return res.json({ msg: 'Dashboard details of revenue', data: data });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


exports.getBarchartRevenue = async (req, res) => {
  try {
    const currentYear = moment().tz('Asia/Kolkata').year();
    const previousYear = currentYear - 1;

    const currentYearMonthlyRanges = getMonthlyDateRanges(currentYear);
    const previousYearMonthlyRanges = getMonthlyDateRanges(previousYear);

    const currentYearRevenue = await Dashboard.getMonthlyRevenue(currentYearMonthlyRanges);
    const previousYearRevenue = await Dashboard.getMonthlyRevenue(previousYearMonthlyRanges);

    const combinedRevenueData = formatCombinedRevenueData(currentYearRevenue, previousYearRevenue);


    return res.json({
      msg: 'Bar chart data of revenue',
      data: combinedRevenueData
    });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};




exports.deleteByIdOrAll = async (req, res) => {
  try{
    const {tableName, type, ids} = req.body;
    if(type === 'all'){
      await Dashboard.deleteAllData(tableName);
    }else if(type==='id'){
      if(!Array.isArray(ids)|| ids.length === 0){
        return res.status(400).json({ errors: ['Ids should not be empty'] });
      }
      for (const singleId of ids) {
        await Dashboard.deleteFromTable(tableName, singleId);
      }
    }
    return res.status(200).json({ msg: 'Deleted successfully' });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}




function formatCombinedRevenueData(currentYearRevenue, previousYearRevenue) {
  let combinedData = [];
  for (let i = 0; i < 12; i++) {
    combinedData.push({
      month: getMonthName(i),
      currentYearRevenue: currentYearRevenue[i].revenue,
      previousYearRevenue: previousYearRevenue[i].revenue
    });
  }
  return combinedData;
}



exports.getAllUserServiceData = async (req, res) => {
  try{
    const data = await userService.findAllUserServices();
    const userCounts = {};
    data.forEach(service => {
      if (userCounts[service.userId]) {
        userCounts[service.userId]++;
      } else {
        userCounts[service.userId] = 1;
      }
    });
    const updatedData = data.map(service => ({
      ...service,
      isRegular: userCounts[service.userId] > 1 ? 'Yes' : 'First Time',
      location: 'Pune'
    }));
    return res.json({ msg: 'Dashboard details of revenue', data: updatedData });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}
