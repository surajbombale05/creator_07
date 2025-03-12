const Request = require('../models/requestModel');
const User = require('../models/userModel');
const { validationResult } = require('express-validator');
const Notification = require('../models/notificationModel');
const Transaction = require('../models/transactionModel');
const path = require('path');
const {formatTimeToIST} = require('../../utils/dateUtils');
const {sendNotification} = require('../../utils/sendNotificationUtils')
const InAppNotification = require('../models/inAppNotificationModel');
const admin = require('firebase-admin');
const { access } = require('fs');

exports.canRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  const {userId,creatorId} = req.body;
  try {
    const findUserById = await User.findUserById(userId);
    if (!findUserById) {
      return res.status(404).json({ errors: ['User not found'] });
    }
    const findCreatorById = await User.findCreatorById(creatorId);
    if (!findCreatorById) {
      return res.status(404).json({ errors: ['Creator not found'] });
    }
    const lastRequest = await Request.findLastRequestByUserAndCreatorId(userId, creatorId);
    const currentTime = new Date();
    
    if (lastRequest) {
      const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;
      const requestTime = new Date(lastRequest.date);
      if (lastRequest.status == 0 && (currentTime - requestTime < twentyFourHoursInMillis)) {
        return res.status(401).json({ errors: ['You can only request after they response to your request, please wait'] });
      }
    }

    return res.status(200).json({ message: 'can request' });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}
exports.createRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  const {userId,creatorId,language,location,description,amount,isThumbnail,isEdited} = req.body;
  
  try {
    const findUserById = await User.findUserById(userId);
    if (!findUserById) {
      return res.status(404).json({ errors: ['User not found'] });
    }
    const findCreatorById = await User.findCreatorById(creatorId);
    if (!findCreatorById ) {
      return res.status(404).json({ errors: ['Creator not found'] });
    }
    const date = formatTimeToIST().format('YYYY-MM-DD HH:mm:ss');
    const newRequest = await Request.create({
      userId,
      creatorId,
      language,
      description,
      amount,
      isThumbnail,
      isEdited,
      date,
      location
    });
    console.log(`device token --------${findCreatorById.device_token}`);
    const sendHireNotification = await sendNotification("duVpDCP6TOWcCguWk8dO32:APA91bGU_zFv4Jh74v1atdZMqe_Y9iq6djccy_Zfj_0HdSRN1xDlfttHyyRcewW3MgHrynwzZlUTHR_r_rlQ5Rg7nMl_DkiFrduGqMnD07rOZas8scnIkKk", 'Congratulations, you have been hired', `You have been hired by ${findUserById.firstName} ${findUserById.lastName}.`);
    console.log(`device token --------${findCreatorById.device_token}`);
    const notificationForHire = await Notification.createHireNotification({
        requestId: newRequest.id,
        userId: findCreatorById.id,
        creatorImagePath: findUserById.profile_image,
        actions:'Hire',
        amount,
        mobile: findCreatorById.mobile,
        notificationType: 'creator',
        message: `you are being hired by "${findUserById.firstName} ${findUserById.lastName}"`,
        date: date
    })
    return res.status(200).json({ message: 'Request Data', data: newRequest });
  } catch (error) {
    // console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};

exports.getAllRequest = async (req, res) => {
    try {
        const banners = await Request.findAllRequests()
        return res.status(200).json({ msg: 'List Of All Requests', data: banners });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getRequestById = async (req, res) => {
  const requestId = req.params.id;

  try {
      const banner = await Request.findRequestById(requestId);
      if (!banner) {
          return res.status(404).json({ error: 'Request not found' });
      }
      return res.json(banner);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.deleteRequest = async (req, res) => {
    const requestId = req.params.id;

    try {
        const success = await Request.deleteRequest(requestId);

        if (!success) {
            return res.status(404).json({ error: 'Request not found' });
        }

        return res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Error in deleteRequest:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getRequestByuserIdId = async (req, res) => {
  const requestUserId = req.params.id;

  try {
      const banner = await Request.findRequestByCreatorOrUserId(requestUserId,req.userId);
      if (!banner) {
          return res.status(404).json({ error: 'Request not found' });
      }
      return res.status(200).json({msg:"All resquest with creatorId",data: banner});
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateRequestStatus = async (req, res) => {
  const {action} = req.body;
  const requestId = parseInt(req.params.id);
  try {
    const date = formatTimeToIST().format('YYYY-MM-DD HH:mm:ss');
    const requestDetails = await Request.findRequestById(requestId);
    if (!requestDetails) {
      return res.status(404).json({ errors: ['Request details not found.'] });
    }
    const { userId,creatorId } = requestDetails;
    const userDetails = await User.findUserById(userId);
    if (!userDetails || !userDetails.device_token) {
      return res.status(404).json({ errors: ['User details or device token not found.'] });
    }
    const creatorDetails = await User.findCreatorById(creatorId);
    if (!creatorDetails) {
      return res.status(404).json({ errors: ['Creator details not found'] });
    }
    let actionSttaus = null;
    if(action === '1'){
      actionSttaus = 'accept'
    }else if(action === '-1'){
      actionSttaus = 'reject'
    }
    const findPaymentNotification = await Notification.findPayNowNotificationByRequestId(requestId);
    if(findPaymentNotification){
      await Notification.updateActionSttaus(requestId,actionSttaus);
      return res.status(200).json({ message: `Payment Request ${actionSttaus}ed successfully` });
    }
    if(requestDetails.status === "1"){
      return res.status(400).json({ errors: [`Request already ${actionSttaus}ed`] });
    }else if(requestDetails.status === "-1"){
      return res.status(400).json({ errors: [`Request already ${actionSttaus}ed`] });
    }
    const updateStatus = await Request.updateRequestStatus(requestId, action, formatTimeToIST().format('YYYY-MM-DD'), formatTimeToIST().format('HH:mm:ss'));
    const { device_token } = userDetails;
    const {firstName,lastName} = creatorDetails
    const sendUpdateNotification = await Notification.create({
      userId: userId,
      requestId: requestId,
      actions: actionSttaus,
      creatorImagePath: creatorDetails.profile_image,
      notificationType: 'creator',
      amount: requestDetails.amount,
      action_status:`${actionSttaus}ed`,
      message: `Hiring Request ${actionSttaus}ed successfully`,
      mobile: creatorDetails.mobile,
      date: date
    })
    if(action === '1'){
      const createUserPayNotification = await Notification.create({
        userId: userId,
        requestId: requestId,
        actions: 'PayNow',
        creatorImagePath: creatorDetails.profile_image,
        notificationType: 'user',
        amount: requestDetails.amount,
        action_status:`make payment`,
        message: `Pay To the creator : '${creatorDetails.firstName} ${creatorDetails.lastName} ' with amount Rs.${requestDetails.amount} to accept the work`,
        mobile: creatorDetails.mobile,
        date: date
      })
    }
    await Notification.updateNotificationActionStatus(requestId,actionSttaus)
    const sendActionNotification = await sendNotification(device_token,`Hiring Request ${actionSttaus}ed successfully`,`Your hiring request has been ${actionSttaus}ed successfully by "${firstName} ${lastName}".`)
    return res.status(200).json({ message: `${actionSttaus}ed the request successfully.` });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};



exports.getAllPendingRequets = async (req, res) => {
  const { userId } = req.body;
  try {
    const requests = await Request.getAllPendingWork(userId)
    return res.status(200).json({ msg: 'List Of All Pending Requests', data: requests });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};

exports.getAllCompleteRequets = async (req, res) => {
  const { userId } = req.body;
  try {
    const requests = await Request.getAllCompleteWork(userId)
    return res.status(200).json({ msg: 'List Of All Complete Requests', data: requests });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};


exports.updateWorkStatus = async (req, res) => {
  const {requestId} = req.body;
  try {
    const findRequest = await Request.findRequestById(requestId);
    if (!findRequest) {
      return res.status(404).json({ errors: ['Request not found'] });
    }
    const updateStatus = await Request.updateCompleteWorkStatus(requestId, 'complete', formatTimeToIST().format('YYYY-MM-DD HH:mm:ss'));
    const createInAppNotification = await InAppNotification.create({
      title: 'Work Completed',
      message: 'Work Completed Give A Review For The Work',
      userIds: [findRequest.userId], 
      action:'on', 
      notification_type:'review', 
      playstore_url:null, 
      ios_url:null, 
      android_min_version:null, 
      android_curr_version:null, 
      ios_min_version:null, 
      ios_curr_version:null, 
      workId:requestId,
      date:formatTimeToIST().format('YYYY-MM-DD'),
      notOpen:0
    })
    await User.substarctPendingStatus(findRequest.creatorId);
    await User.updateCompleteStatus(findRequest.creatorId);
    return res.status(200).json({ message: 'Work status updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};

