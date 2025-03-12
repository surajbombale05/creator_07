const collaboratorRequest = require('../models/collaboratorRequestModel');
const User = require('../models/userModel');
const { validationResult } = require('express-validator');
const Notification = require('../models/notificationModel');
const path = require('path');
const admin = require('firebase-admin');
const moment = require('moment-timezone');
const {sendNotification} = require('../../utils/sendNotificationUtils')
const {formatTimeToIST} = require('../../utils/dateUtils');


  exports.createcollaboratorRequest = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ errors: errorMessages });
    }
    const {userId,collaboratorId,description} = req.body;
    try {
      const date = formatTimeToIST().format('YYYY-MM-DD HH:mm:ss');
      const findUserById = await User.findCollaboratorById(userId);
      if (!findUserById) {
        return res.status(404).json({ errors: ['User not found'] });
      }
      const findCollaboratorById = await User.findCollaboratorById(collaboratorId);
      if (!findCollaboratorById ) {
        return res.status(404).json({ errors: ['Collaborator not found'] });
      }
      const newRequest = await collaboratorRequest.create({
        userId,
        collaboratorId,
        description,
        image_path: findUserById.profile_image,
        name: `${findUserById.firstName} ${findUserById.lastName}`,
        date
      });
      const sendCollaboratorNotification = await sendNotification(findCollaboratorById.device_token,`Congratulations You have a collaboration request`, `Congratulations, you have a collaboration request from "${findUserById.firstName} ${findUserById.lastName}."`)
      const notificationForHire = await Notification.createHireCollaboratorNotification({ 
          userId:collaboratorId,
          requestId: newRequest.id,
          actions:'Hire',
          creatorImagePath: findUserById.profile_image,
          notificationType: 'collaborator',
          message: `you have a collaboration request from "${findUserById.firstName} ${findUserById.lastName}"`,
          mobile: findCollaboratorById.mobile,
          date: date
      })
      return res.status(200).json({ message: 'Request Data', data: newRequest });
    } catch (error) {
      console.error(error);
      return res.status(407).json({ errors:['Something went wrong'] });
    }
  };


  exports.updatecollaboratorRequestStatus = async (req, res) => {
    const {action} = req.body;
    const requestId = req.params.id;
    try {
      const requestDetails = await collaboratorRequest.findCollaboratorRequestById(requestId);
      if (!requestDetails) {
        return res.status(404).json({ errors: ['collaborator Request details not found.'] });
      }
      if(requestDetails.status === "1"){
        return res.status(400).json({ errors: ['Request is already accepted'] });
      }else if(requestDetails.status === "-1"){
        return res.status(400).json({ errors: ['Request is already rejected'] });
      }
      let actionStatus = null;
      if(action === '1'){
        actionStatus = 'accept';
      }else if(action === '-1'){
        actionStatus = 'reject';
      }
      await collaboratorRequest.updateCollaboratorStatus(requestId,action,formatTimeToIST().format('YYYY-MM-DD'),formatTimeToIST().format('HH:mm:ss'));
      const date = formatTimeToIST().format('YYYY-MM-DD HH:mm:ss');
      const { userId,collaboratorId } = requestDetails;
      const userDetails = await User.findUserById(userId);
      if (!userDetails || !userDetails.device_token) {
        return res.status(404).json({ errors: ['User details or device token not found.'] });
      }
      const collaboratorDetails = await User.findCollaboratorById(collaboratorId);
      if (!collaboratorDetails) {
        return res.status(404).json({ errors: ['Collaborator details not found'] });
      }
      const { device_token } = userDetails;
      const {firstName,lastName} = collaboratorDetails
      const sendUserNotification = await Notification.createCollaboratorNotification({
        userId: userId,
        requestId: requestId,
        actions: actionStatus,
        creatorImagePath: collaboratorDetails.profile_image,
        message: `Collaboration Request ${actionStatus}ed successfully`,
        mobile: collaboratorDetails.mobile,
        notificationType: 'collaborator',
        action_status: actionStatus,
        date: date
      })
      const sendCollaboratorNotification = await sendNotification(device_token,`Collaboration Request ${actionStatus}ed successfully`, `Collaboration Request ${actionStatus}ed successfully from "${firstName} ${lastName}."`)
      await Notification.updateCollaboratorNotificationStatus(requestId,actionStatus);
      return res.status(200).json({ message: `${actionStatus}ed the collaborator request successfully.` });
    } catch (error) {
      console.error(error);
      return res.status(407).json({ errors: ['Something went wrong'] });
    }
  };

