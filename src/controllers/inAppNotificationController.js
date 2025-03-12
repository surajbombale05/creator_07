const InAppNotification = require("../models/inAppNotificationModel");
const { validationResult } = require('express-validator');
const User = require("../models/userModel");
const CronTask = require("../models/cronTaskModel");
const Request = require("../models/requestModel");
const path = require('path');
const { url } = require("inspector");
const moment = require('moment-timezone');
const {sendNotification,sendNotificationMulticast,sendNotificationToAll,sendNotificationToMultiUsers} = require('../../utils/sendNotificationUtils')
const {formatTimeToIST,getNotificationTypeDate} = require('../../utils/dateUtils')
const { parse, format } = require('date-fns');


exports.getDashBoardDetails = async (req, res) => {
  try{
    const dashboard = await InAppNotification.getdashboardData();
    const data = {
      total: dashboard.total_rows ?? 0,
      popup_total: dashboard.total_popup ?? 0,
      event_total: dashboard.total_event ?? 0,
      schedule_total: dashboard.total_schedule ?? 0,
    }
    return res.json({ msg: 'Dashboard details', data: data });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}

exports.sendTempleteNotification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  const { notificationId } = req.body;
  
  try {
    const notification = await InAppNotification.findNotificationById(notificationId);
    if (notification.length > 0) {
      return res.status(400).json({ error: `Invalid id: ${notificationId}` });
    }

    const {title,message,url,image} = notification;
    const randomNumber = generateRandomNumber(19).toString();
    const userids =  JSON.parse(notification.userIds);

    if(Array.isArray(userids)){
      if(userids[0]=='all'){
        await sendNotificationToAll(title,message,url,image,randomNumber);
      }else{
        const deviceTokens = await User.getTokensbyIds(userids);
        await sendNotificationToMultiUsers(title,message,url,image,deviceTokens);
      }
    } else{
      const user = await User.findUserById(userids);
      await sendNotification(user.device_token,title,message,url,image);
    }
  
    return res.status(200).json({ message: 'Successfully sent to all' });

  } catch (error) {
      console.error(error);
      return res.status(407).json({ errors: ["Something went wrong"] });
  }

}
exports.deleteInAppNotification = async (req, res) => {
  const notificationId = req.params.id;

  try {
    const success = await InAppNotification.deleteNotification(notificationId);

    if (!success) {
      return res.status(404).json({ errors: ["Notification not found"] });
    }

    return res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error in Notification:", error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};
exports.deleteInAppNotificationWithMessageId = async (req, res) => {
  const notificationId = req.params.id;
  const userid = Number(req.params.userid);

  try {
    const notification = await InAppNotification.findNotificationById(notificationId);
    if (notification.length > 0) {
      return res.status(400).json({ error: `Invalid id: ${notificationId}` });
    }
    let success = false;
    if(notification.notificationSentTo!='Individual'){
      success = await InAppNotification.deleteUserIdFromNotification(notificationId,userid);
    }else{
      success = await InAppNotification.deleteNotification(notificationId);
    }

    if (!success) {
      return res.status(404).json({ errors: ["Notification not found"] });
    }

    return res.json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error("Error in Notification:", error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.createInAppNotification = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ errors: errorMessages });
    }
  
    const { title, message, userIds, action, notification_type, playstore_url, ios_url, android_min_version, android_curr_version, ios_min_version, ios_curr_version } = req.body;
    
    try {
        const invalidUserIds = await validateUserIds(userIds);
        if (invalidUserIds.length > 0) {
            return res.status(400).json({ errors: [`Invalid userIds: ${invalidUserIds.join(', ')}`] });
        } 

        if (notification_type === 'update' && ((!playstore_url || playstore_url.trim() === '') || (!ios_url || ios_url.trim() === ''))) {
          return res.status(400).json({ errors: ['Playstore URL and iOS URL are required for notification type "update"'] });
      }
      
      if (notification_type === 'update' && (!android_min_version || !android_curr_version || !ios_min_version || !ios_curr_version)) {
        return res.status(400).json({ errors: ['Android and iOS minimum and current versions are required for notification type "update"'] });
      }

      const newNotification = await InAppNotification.create({
        title,
        message,
        userIds,
        action,
        notification_type,
        playstore_url,
        ios_url,
        android_min_version,
        android_curr_version,
        ios_min_version,
        ios_curr_version,
        creatorId: null,
      });
  
      return res.status(200).json({ message: 'In-App Notification created successfully', data: newNotification });
    } catch (error) {
      console.error(error);
      return res.status(407).json({ errors: ['Something went wrong'] });
    }
  };

  async function validateUserIds(userIds) {
    const invalidUserIds = [];

    for (const userId of userIds) {
        try {
            userId = Number(userId);
            const user = await User.findUserById(userId);
            if (!user) {
                invalidUserIds.push(userId);
            }
        } catch (error) {
            console.error(`Error while validating userId ${userId}: ${error.message}`);
        }
    }

    return invalidUserIds;
}


exports.getNotificationByUserId = async (req, res) => {
  const {userId} = req.body;
  try {
      const allNotifications = await InAppNotification.findAllNotifications();
      for (const notification of allNotifications) {
          const userIdsArray = JSON.parse(notification.userIds);
          if (Array.isArray(userIdsArray) && userIdsArray.includes(parseInt(userId,10)) && notification.action === "on") {
              return res.status(200).json({
                  notification_id: notification.id,
                  title: notification.title,
                  message: notification.message,
                  notification_type: notification.notification_type,
                  playstore_url: notification.playstore_url||null,
                  ios_url: notification.ios_url||null,
                  android_min_version: notification.android_min_version||null,
                  android_curr_version: notification.android_curr_version||null,
                  ios_min_version: notification.ios_min_version||null,
                  ios_curr_version: notification.ios_curr_version||null,
                  image: notification.image||null,
                  url: notification.url||null
              });
          }
      }
      return res.status(404).json({ data: "No notification found" });
  } catch (error) {
      console.error(error);
      return res.status(407).json({ errors: ["Something went wrong"] });
  }
};



exports.updateInAppNotificationNew = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  const notificationId = req.params.id;
  const { title, message,url,scheduledDate,scheduledTime } = req.body;
  let imagePath;
  if (req.file) {
    let workImagePath = req.file.path.replace(/\\/g, "/");
    imagePath = "/" + path.basename(workImagePath);
  }

  let formattedScheduledDate = null;
  if (scheduledDate) {
    formattedScheduledDate = scheduledDate + ' ' +scheduledTime;
  }

  const newData = {
    title,
    message,
    url,
    scheduledDate:formattedScheduledDate,
  }

  if(imagePath){
    newData.image = imagePath;
  }

  const findUpdatedInAppNotification = await InAppNotification.findNotificationById(notificationId);

    // scheduled notification with cron
    const task_id = findUpdatedInAppNotification.id;
    const task_type = 'inappnotification';
    const dateObj = parse(formattedScheduledDate, 'yyyy-MM-dd hh:mm a', new Date());
    const tasktime = format(dateObj, 'yyyy-MM-dd HH:mm:ss');
    const cronData = {task_id,task_type,tasktime};
    await CronTask.create(cronData);


  const updateInAppNotification = await InAppNotification.updateNotificationNew(notificationId, newData);

  if(!updateInAppNotification) {
    return res.status(404).json({ error: 'In-App Notification not found' });
  }
  

  return res.status(200).json({ message: 'In-App Notification updated successfully', data: findUpdatedInAppNotification });
}

exports.updateInAppNotification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  const notificationId = req.params.id;
  const { title, message, userIds, action, notification_type, playstore_url, ios_url, android_min_version, android_curr_version, ios_min_version, ios_curr_version } = req.body;

  try {
    let updateInAppNotification;

    if (userIds && userIds.length === 0) {
      return res.status(400).json({ error: 'UserIds cannot be an empty array' });
    }


    if (userIds && userIds.length > 0) {
      const isValidUserIds = await validateUserIds(userIds);
      if (isValidUserIds.length > 0) {
        return res.status(400).json({ error: `Invalid userIds: ${isValidUserIds.join(', ')}` });
    } 
    }

    if(title!==undefined && title.trim() === ''){
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    if(message!==undefined && message.trim() === ''){
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    
    if (notification_type !== undefined && notification_type !== 'notification' && notification_type !== 'update') {
      return res.status(400).json({ error: 'Invalid notification type' });
    }
    
    if(notification_type && notification_type ==='notification'){
      updateInAppNotification = await InAppNotification.updateNotification(notificationId, {
        title,
        message,
        userIds,
        action,
        notification_type,
        playstore_url: null,
        ios_url: null,
        android_min_version: null,
        android_curr_version: null,
        ios_min_version: null,
        ios_curr_version: null
      });

    }else if(notification_type && notification_type === 'update'){
      if (!playstore_url || playstore_url.trim() === '' || 
          !ios_url || ios_url.trim() === '' || 
          !android_min_version || android_min_version.trim() === '' || 
          !android_curr_version || android_curr_version.trim() === '' || 
          !ios_min_version || ios_min_version.trim() === '' || 
          !ios_curr_version || ios_curr_version.trim() === '') {
        return res.status(400).json({ error: 'Required fields are missing or empty for update notification' });
      }

      updateInAppNotification = await InAppNotification.updateNotification(notificationId, {
        title,
        message,
        userIds,
        action,
        notification_type,
        playstore_url,
        ios_url,
        android_min_version,
        android_curr_version,
        ios_min_version,
        ios_curr_version
      });
    } else {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    if(!updateInAppNotification) {
      return res.status(404).json({ error: 'In-App Notification not found' });
    }

    const findUpdatedInAppNotification = await InAppNotification.findNotificationById(notificationId);
    return res.status(200).json({ message: 'In-App Notification updated successfully', data: findUpdatedInAppNotification });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}


exports.getAllReviewInappNotification = async (req, res) => {
  const { userId } = req.body;
  try {
    const inAppNotifications = await InAppNotification.findAllReviewNotifications(`[${userId}]`);
    return res.status(200).json({ message: 'In-App Notification fetched successfully', data: inAppNotifications });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}



exports.createInAppNotificationForSingleUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  const { title, message, userIds, url} = req.body;
  try {
    let imagePath;
    const invalidUserIds = await validateUserIds(userIds);  
    if (invalidUserIds.length > 0) {
      return res.status(400).json({ errors: [`User Not found`] });
    }
      if (req.file) {
        let workImagePath = req.file.path.replace(/\\/g, "/");
        imagePath = "/" + path.basename(workImagePath);
    }
    const createInAppNotification = await InAppNotification.create({
      title,
      message,
      userIds: [parseInt(userIds,10)],
      action:'on',
      notification_type: 'notification',
      playstore_url: null,
      ios_url: null,
      android_min_version: null,
      android_curr_version: null,
      ios_min_version: null,
      ios_curr_version: null,
      image: imagePath ? imagePath : null,
      url: url.trim()==='' ? null : url,
      workId: null,
      date: formatTimeToIST().format('YYYY-MM-DD'),
      notOpen: [userIds].length,
    });

    return res.status(200).json({ message: 'In-App Notification created successfully', data: createInAppNotification });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }

}


exports.createFcmNotification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  try{
    const {title, message, url, notificationType, notificationSentTo, scheduledDate, scheduledTime, userIds} = req.body;
    let imagePath;
    if (req.file) {
      let workImagePath = req.file.path.replace(/\\/g, "/");
      imagePath = "/" + path.basename(workImagePath);
    }
    const scheduled = notificationType === 'schedule' ? 'YES' : 'NO';
    let formattedScheduledDate = null;
    if (scheduledDate) {
      // const timezone = 'Asia/Kolkata'; 
      // formattedScheduledDate = moment.tz(scheduledDate, 'DD-MM-YYYY h:mm A', timezone).format('YYYY-MM-DD HH:mm:ss');
      formattedScheduledDate = scheduledDate + ' ' +scheduledTime;
    }
    let ids = ['all'];
    if(notificationSentTo !== 'Individual' && notificationSentTo !== 'All'){
    const findNotificationDate = await getNotificationTypeDate(notificationSentTo);
    const findUsers = await User.getUsersActiveOnDate(formatTimeToIST().format('YYYY-MM-DD'), findNotificationDate);
    ids = findUsers.map(user => user.id);
    const deviceTokens = findUsers.map(user => user.device_token);
    if(findUsers.length === 0){
      return res.status(400).json({ error: 'No user found' });
    }
  }
    const createInAppNotification = await InAppNotification.createFcmNotification({
      title,
      message,
      userIds: notificationSentTo === 'Individual' ? JSON.parse(userIds) : ids,
      action: 'on',
      notification_type: 'notification',
      playstore_url: null,
      ios_url: null,
      android_min_version: null,
      android_curr_version: null,
      ios_min_version: null,
      ios_curr_version: null,
      image: imagePath ? imagePath : null,
      url: url.trim()==='' ? null : url,
      workId: null,
      type: 'FCM',
      notificationType: notificationType,
      notificationSentTo: notificationSentTo,
      scheduled: scheduled,
      scheduledDate: scheduled === 'YES' && formattedScheduledDate ? formattedScheduledDate : null,
      date: formatTimeToIST().format('YYYY-MM-DD'),
      notOpen: ids.length>0 ? ids.length: JSON.parse(userIds).length,
    });
    const randomNumber = generateRandomNumber(19).toString();

    if(scheduled === 'YES'){
      // scheduled notification with cron
      const task_id = createInAppNotification.id;
      const task_type = 'inappnotification';
      const dateObj = parse(formattedScheduledDate, 'yyyy-MM-dd hh:mm a', new Date());
      const tasktime = format(dateObj, 'yyyy-MM-dd HH:mm:ss');
      const cronData = {task_id,task_type,tasktime};
      await CronTask.create(cronData);
    }
    if(notificationType === 'event'){
        if(notificationSentTo === 'All'){
          const allUser = await User.findAllUsers('all',null,null,'')
          const newNotification = await InAppNotification.findNotificationById(createInAppNotification.id);
           const sendNotificationToAllUser = await sendNotificationToAll(title,message,url,newNotification.image,randomNumber);
           await InAppNotification.updateNotificationMessageId(createInAppNotification.id, randomNumber);
           await InAppNotification.updateNotOpen(createInAppNotification.id, allUser.length);
        }
    }
    return res.status(200).json({ message: 'In-App Notification created successfully', data: createInAppNotification });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}



exports.createFcmNotificationForSingleUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  try{
    const {title, message, url, notificationType, notificationSentTo, scheduledDate, userIds} = req.body;
    let imagePath;
    if (req.file) {
      let workImagePath = req.file.path.replace(/\\/g, "/");
      imagePath = "/" + path.basename(workImagePath);
    }
    const scheduled = notificationType === 'schedule' ? 'YES' : 'NO';
    let formattedScheduledDate = null;
    if (scheduledDate) {
      const timezone = 'Asia/Kolkata'; 
      formattedScheduledDate = moment.tz(scheduledDate, 'DD-MM-YYYY h:mm A', timezone).format('YYYY-MM-DD HH:mm:ss');;
    }
    const findUserDeviceToken = await User.findUserById(userIds);
    const createInAppNotification = await InAppNotification.createFcmNotification({
      title,
      message,
      userIds: JSON.parse(userIds),
      action: 'on',
      notification_type: 'notification',
      playstore_url: null,
      ios_url: null,
      android_min_version: null,
      android_curr_version: null,
      ios_min_version: null,
      ios_curr_version: null,
      image: imagePath ? imagePath : null,
      url: url.trim()==='' ? null : url,
      workId: null,
      type: 'FCM',
      notificationType: notificationType,
      notificationSentTo: notificationSentTo,
      scheduled: scheduled,
      scheduledDate: scheduled === 'YES' && formattedScheduledDate ? formattedScheduledDate : null,
      messageId: generateRandomNumber(19).toString(),
      date: formatTimeToIST().format('YYYY-MM-DD'),
      notOpen: 1,
    });
    if(notificationType==='event'){
    const findNotification = await InAppNotification.findNewCreatedEventNotifcation();
    const sentNotificationTotheUser = await sendNotificationMulticast(findUserDeviceToken.device_token,findNotification[0].title,findNotification[0].message,findNotification[0].url,findNotification[0].image,findNotification[0].messageId);
    }
    return res.status(200).json({ message: 'Notification Sent Successfully to the user'});
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


exports.AddNotificationCount = async (req, res) => {
  const { messageId } = req.body;
  try {
    const notificationCount = await InAppNotification.updateNotificationCount(messageId);
    return res.status(200).json({ message: 'Notification Count updated successfully'});
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}



function generateRandomNumber(digits) {
  let randomNumber = '';
  for (let i = 0; i < digits; i++) {
      randomNumber += Math.floor(Math.random() * 10); // Generate a random digit (0-9)
  }
  return randomNumber;
}



exports.getAllNotificationData = async (req, res) => {
  try{
    const notificationType = req.body.notificationType ? req.body.notificationType : null;
    const data = await InAppNotification.findAllNotificationWithType(notificationType);
    const dataWithCounts = await getClickProfiles(data);
    return res.status(200).json({ msg:'All Notification Fetched Successfully',data: dataWithCounts });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


exports.getNotificationDashboard = async (req, res) => {
  try{
    const data = await InAppNotification.countNotification();
    return res.status(200).json({ msg:'Notification Dashboard Fetched Successfully',data: data });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}

exports.getAllViewedByTopics = async (req, res) => {
  const {notificationId} = req.body
    try {
        const topics = await InAppNotification.findNotificationById(notificationId);
        if(!topics) {
          return res.status(404).json({ errors: ['Topic not found'] });
        }
        if(topics.userIds === null){
          return res.status(404).json({ errors: ['No People Viewed this Topic'] });
        }
        const viewedByArray = JSON.parse(topics.userIds);
        const removeDublicate = new Set(viewedByArray);
        const viewedBy = [...removeDublicate]; 
        const findUserDetails = viewedBy.map(async (userId) => {
          const user = await User.findUserById(userId);
          return {userId, name: `${user.firstName} ${user.lastName}`, image_path: user.profile_image};
        })    
        return res.json({ message: 'List Of All Topics Viewers', data: await Promise.all(findUserDetails) });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
};


async function getClickProfiles(topics) {
  return Promise.all(topics.map(async (topic) => {
    try {
      const viewedByArray = topic.userIds ? JSON.parse(topic.userIds) : []; 
      if (!Array.isArray(viewedByArray)) {
        console.warn(`Invalid viewedBy format for topic ID ${topic.id}:`, topic.userIds);
        return { ...topic, openBy: [] };
      }  
      const lastSixViewedBy = [...viewedByArray].slice(-6).reverse();
      const profileImagesPromises = lastSixViewedBy.map(id => User.findUserById(id));
      const profileImages = await Promise.all(profileImagesPromises).then(profiles => profiles.map(profile => profile.profile_image));
      topic.openBy = profileImages;
      return topic;
    } catch (error) {
      console.error(`Error processing topic ID ${topic.id}:`, error);
      return { ...topic, openBy: [] }; 
    }
  }));
}