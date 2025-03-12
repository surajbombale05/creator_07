const Notification = require("../models/notificationModel");
const userNotification = require("../models/userNotificationModel");
const admin = require("firebase-admin");
const serviceAccount = require("../../config/creator07-mt-firebase-adminsdk-8gpod-025ca2b5be.json");
const { validationResult } = require("express-validator");
const path = require("path");
const {sendNotification} = require('../../utils/sendNotificationUtils')
const {formatTimeToIST} = require("../../utils/dateUtils");
const User = require("../models/userModel");



exports.getNotificationByuserId = async (req, res) => {
  const UserId = req.params.id;
  try {
    const notification = await Notification.findAllNotificationsWithUserId(
      UserId
    );
    if (!notification) {
      return res.status(404).json({ error: "User not found" });
    }
    return res
      .status(200)
      .json({ msg: "All notification with userId", data: notification });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.sendNotificationToUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  try{
  const { title, message, url,userId} = req.body;
  let imagepath;
  if (req.file) {
    let notificationImagePath = req.file.path.replace(/\\/g, "/");
    imagepath = "/" + path.basename(notificationImagePath);
  }

  const findUserById = await User.findUserById(userId);
  const date = await formatTimeToIST().format('YYYY-MM-DD HH:mm:ss');
  const createUserNotification = await userNotification.create({
    title,
    message,
    url,
    userId,
    userType: 'user',
    dateRange: 'single_user',
    date,
    imagePath: imagepath
  })
  const findUserNotification = await userNotification.findNotificationsByUserId(userId, formatTimeToIST().format('YYYY-MM-DD'));
  const sendUserNotification = await sendNotification(findUserById.device_token, findUserNotification[0].title, findUserNotification[0].message, findUserNotification[0].url, findUserNotification[0].imagePath)
  if(sendUserNotification.failure === 1){
    return res.status(400).json({ errors: [`${sendUserNotification.results[0].error}`] });
  }
  return res.status(200).json({ msg: "Notification sent successfully" });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
  }



exports.userInAppNotification = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  try{
  const { title, message, url,userId} = req.body;
  let imagepath;
  if (req.file) {
    let notificationImagePath = req.file.path.replace(/\\/g, "/");
    imagepath = "/" + path.basename(notificationImagePath);
  }
  const findUserById = await User.findUserById(userId);
  const date = await formatTimeToIST().format('YYYY-MM-DD HH:mm:ss');
  const createUserNotification = await userNotification.create({
    title,
    message,
    url,
    userId,
    userType: 'user',
    dateRange: 'in_app_notification',
    date,
    imagePath: imagepath
  })
  const findInappNotification = await userNotification.findInAppNotificationsByUserId(userId, formatTimeToIST().format('YYYY-MM-DD'));
  return res.status(200).json({ msg: "In app Notification sent successfully", data: findInappNotification });
}catch(error){
  console.error(error);
  return res.status(407).json({ errors: ["Something went wrong"] });
}
}


exports.getInAppNotificationByUserId = async (req, res) => {
  try{
  const { userId } = req.body;
  const findInappNotification = await userNotification.findInAppNotificationsByUserId(userId, formatTimeToIST().format('YYYY-MM-DD'));
  return res.status(200).json({ status: true,msg:'In app notification fetched successfully', data: findInappNotification });
}catch(error){
  console.error(error);
  return res.status(407).json({ errors: ["Something went wrong"] });
}
}



exports.createUserNotification = async (req, res) => {
  const {} = req.body;
  try{
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
}

