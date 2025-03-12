const cron = require('node-cron');
const User = require('../models/userModel');
const CronTask = require('../models/cronTaskModel');
const InAppNotification = require("../models/inAppNotificationModel");
const admin = require('firebase-admin');
const {sendNotification,sendNotificationToAll,sendNotificationToMultiUsers} = require('../../utils/sendNotificationUtils')


const startScheduledTask = () => {
    cron.schedule('59 * * * *', async () => {
      try {
        console.log('Cron scheduled at this moment');
        await User.updateActiveStatusForPreviousDay();
        console.log('Daily task completed.');
      } catch (error) {
        console.error('Error in daily task:', error);
      }
    });

    cron.schedule("0 3 * * *", async () => {
      try {
        checkPendingTask();
      } catch (error) {
        console.error('Error in daily task:', error);
      }
    });
};

const checkPendingTask = async () => {
  const tasks = await CronTask.fetchTasksForCurrentTime();
  if (tasks.length > 0) {
      for (const task of tasks) {
          if (task.task_type === 'inappnotification') {
              await sendInAppNotification(task.task_id);
              await CronTask.deleteCronTask(task.task_id);
          }
      }
  }
}

const sendInAppNotification = async task_id => {
  const notification = await InAppNotification.findNotificationById(task_id);
  const {title,message,url,image} = notification;
  const randomNumber = generateRandomNumber(19).toString();
  const userids = JSON.parse(notification.userIds);

  try {
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

  } catch(err){
    console.log('some error');
  }
}

function generateRandomNumber(digits) {
  let randomNumber = '';
  for (let i = 0; i < digits; i++) {
      randomNumber += Math.floor(Math.random() * 10); // Generate a random digit (0-9)
  }
  return randomNumber;
}
function scheduleNotifications(userId, notificationTime, title) {

  const notificationTimes = [
      new Date(notificationTime - 30 * 60 * 1000), // 30 minutes ago
      new Date(notificationTime - 10 * 60 * 1000), // 10 minutes ago
      new Date(notificationTime - 5 * 60 * 1000)   // 5 minutes ago
  ];
  const cronPatterns = notificationTimes.map(time => {
    let hours = time.getUTCHours();
    let minutes = time.getUTCMinutes();
    let dayOfMonth = time.getUTCDate();
    
    return `${minutes} ${hours} ${dayOfMonth} * *`; 
  });

  cronPatterns.forEach(pattern => {
    cron.schedule(pattern, () => {
      sendNotification(userId, title);
    });
  });
}



module.exports = { startScheduledTask, scheduleNotifications };
