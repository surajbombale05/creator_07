const Transaction = require("../models/transactionModel");
const User = require("../models/userModel");
const Request = require("../models/requestModel");
const { validationResult } = require("express-validator");
const { formatTimeToIST } = require("../../utils/dateUtils");
const { sendNotification } = require("../../utils/sendNotificationUtils");
const PaymentData = require("../models/paymentDataModel");
const admin = require("firebase-admin");
const Service = require("../models/serviceModel");
const Notification = require("../models/notificationModel");
const userService = require("../models/userServiceModel");
const { getExpryDate } = require("../../utils/dateUtils");
const Admin = require("../models/adminModel");
const moment = require('moment-timezone');


exports.createPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  try {
    const {
      amount,
      requestId,
      paymentMethod,
      paymentStatus,
      orderId,
      payment_session_id,
    } = req.body;
    const findRequest = await Request.findRequestById(requestId);
    if (!findRequest) {
      return res.status(404).json({ errors: ["Request not found"] });
    }
    const user = await User.findUserById(findRequest.userId);
    if (!user) {
      return res.status(404).json({ errors: ["User not found"] });
    }
    const findCreatorDeviceToken = await User.findUserById(
      findRequest.creatorId
    );
    const device_token = findCreatorDeviceToken.device_token;
    const date = formatTimeToIST().format("YYYY-MM-DD HH:mm:ss");
    if (paymentStatus.toLowerCase() === "success") {
      await User.addAmount(findCreatorDeviceToken.id, amount);
      const createTransaction = await Transaction.create({
        userId: findCreatorDeviceToken.id,
        balance: findCreatorDeviceToken.balance,
        type: "add",
        amount: amount,
        date: date,
        message: `Payment for rs. ${amount} added successfully by ${user.firstName} ${user.lastName}.`,
        transactionType: `creatorPayment`,
        reason: `${user.firstName} ${user.lastName} Hired you for : '${findRequest.description}'.`,
      });
      await Request.updateWorkStatus(requestId, "live", date);
      await User.addPendingStatus(findCreatorDeviceToken.id);
      try{
        const sendNotificationToUser = await sendNotification(
          device_token,
          "Payment Done Successfully",
          `Payment for rs. ${amount} done successfully by ${user.firstName} ${user.lastName}.`
        );
      }catch(err){}
      const createNotification = await Notification.create({
        userId: findCreatorDeviceToken.id,
        requestId: requestId,
        actions: "accept",
        creatorImagePath: user.profile_image,
        message: `Payment for rs. ${amount} done successfully by ${user.firstName} ${user.lastName}.`,
        notificationType: "creator",
        action_status: "payment_done",
        date: date,
        amount: amount,
        mobile: user.mobile,
      });
    }

    const createPaymentData = await PaymentData.create({
      userId: user.id,
      orderId: orderId,
      paymentTransactionId: payment_session_id,
      paymentType: paymentMethod,
      paymentStatus: paymentStatus,
      amount: amount,
      date: date,
    });
    return res
      .status(201)
      .json({
        message: "Payment created successfully",
        data: createPaymentData,
      });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.getTransactionByRequestId = async (req, res) => {
  const { requestId } = req.body;
  try {
    const findUser = await User.findUserById(requestId);
    if (!findUser) {
      return res.status(404).json({ errors: ["User not found"] });
    }
    const transactions = await Transaction.findTransactionByRequestId(
      requestId
    );
    return res.status(200).json({ message: "Transactions found", data: transactions });
  } catch (error) {
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.createServicePayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  try {
    const {
      amount,
      userId,
      serviceId,
      paymentMethod,
      paymentStatus,
      orderId,
      payment_session_id,
    } = req.body;
    const user = await User.findUserById(userId);
    if (!user) {
      return res.status(404).json({ errors: ["User not found"] });
    }
    const findService = await Service.findServiceById(serviceId);
    if (!findService) {
      return res.status(404).json({ errors: ["Service not found"] });
    }
    const device_token = user.device_token;
    const date = formatTimeToIST().format("YYYY-MM-DD HH:mm:ss");
    const findAdmin = await Admin.findAdmin();
    if (findAdmin === 0) {
      return res.status(404).json({ errors: ["Admin not found"] });
    }
    if (paymentStatus.toLowerCase() === "success") {
      const findExpiryDate = await getExpryDate(findService.serviceType);
      const createUserService = await userService.createUserService({
        userId: user.id,
        serviceId: serviceId,
        serviceType: findService.serviceType,
        amount: amount,
        serviceTakenDate: date,
        serviceExpiryDate: findExpiryDate,
      });
      await User.updateUserIsPaid(user.id, "YES");
      await Admin.addAdminAmount(findAdmin[0].id, amount);
      const createTransaction = await Transaction.create({
        userId: findAdmin[0].id,
        balance: findAdmin[0].balance,
        type: "add",
        amount: amount,
        date: date,
        message: `Payment for rs. ${amount} added successfully by ${user.firstName} ${user.lastName} for ${findService.title} service.`,
        transactionType: `userPaymentToAdmin`,
        reason: `Payment for rs. ${amount} added successfully by ${user.firstName} ${user.lastName} for ${findService.title} service.`,
      });
      const createNotification = await Notification.create({
        userId: findAdmin[0].id,
        requestId: serviceId,
        actions: "accept",
        creatorImagePath: user.profile_image,
        message: `Payment for rs. ${amount} done successfully by ${user.firstName} ${user.lastName} for ${findService.title} service.`,
        notificationType: "admin",
        action_status: "payment_done",
        date: date,
        amount: amount,
        mobile: user.mobile,
      });
    }
    const paymentData = await PaymentData.create({
      userId: user.id,
      orderId: orderId,
      paymentTransactionId: payment_session_id,
      paymentType: paymentMethod,
      paymentStatus: paymentStatus,
      amount: amount,
      date: date,
    });
    return res
      .status(201)
      .send({
        message: "Payment created successfully for service",
        data: paymentData,
      });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.getLiveServiceOfUser = async (req, res) => {
  const { userId } = req.body;
  try {
    const findUser = await User.findUserById(userId);
    let transactions = await userService.findUserServicesByUserId(userId);
    const getAllTeamdMenbers = await Admin.findAllTeamMember();
    if (transactions.length === 0) {
      return res
        .status(200)
        .json({ message: "get live service of user", data: transactions });
    }
    const getServiceIds = transactions.map(
      (transaction) => transaction.serviceId
    );
    const getAllServices = await Service.getAllActiveServices();
    const filteredServices = getAllServices.filter(
      (service) => !getServiceIds.includes(service.id)
    );
    const getTeamIds = getAllTeamdMenbers.map((team) => team.id);
    const shuffledIds = shuffleArray(getTeamIds);
    const findTeamMemberById = await Admin.findAdminById(shuffledIds[0]);
    if (!findTeamMemberById) {
      return res.status(400).send({ errors: ["Team member not found"] });
    }
    let result = null;
    if (findUser.teamMemberAssigned === null) {
      await User.updateTeamId(userId, findTeamMemberById.id);
      result = {
        message: "get live service of user",
        data:transactions,
        assistant: {
          id: findTeamMemberById.id,
          name: findTeamMemberById.name,
          email: findTeamMemberById.email,
          mobile: findTeamMemberById.mobile,
          profile_image: findTeamMemberById.image,
        },
        servicesLeftToBuy: filteredServices,
      };
    return res
      .status(200)
      .json(result);
    }

    const findTeamMember = await Admin.findAdminById(
      findUser.teamMemberAssigned
    );
    result = {
      message: "get live service of user",
      data:transactions,
      assistant: {
        id: findTeamMember.id,
        name: findTeamMember.name,
        email: findTeamMember.email,
        mobile: findTeamMember.mobile,
        profile_image: findTeamMember.image,
      },
      servicesLeftToBuy: filteredServices,
    }

    return res
      .status(200)
      .json(result);
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}




exports.getAllUserServices = async (req, res) => {
  try {
    const services = await userService.findAllUserServices();
    const updatedServices = services.map(service => {
      let serviceExpiryDate = moment.tz(service.serviceExpiryDate, "YYYY-MM-DD HH:mm:ss", 'Asia/Kolkata');
      let currentDate = moment.tz('Asia/Kolkata');
      service.serviceExpired = currentDate.isAfter(serviceExpiryDate) ? "YES" : "NO";

      return service;
    });

    return res.status(200).json({ message: "All user services", data: updatedServices });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};


exports.updateServiceStatus = async (req, res) => {
  const { serviceId, status } = req.body;
  try {
    const findService =  await userService.findServiceById(serviceId);
    if (!findService) {
      return res.status(404).json({ errors: ["Service not found"] });
    }
    let serviceExpiryDate = moment.tz(findService.serviceExpiryDate, "YYYY-MM-DD HH:mm:ss", 'Asia/Kolkata');
    let currentDate = moment.tz('Asia/Kolkata');
    if(!currentDate.isAfter(serviceExpiryDate)) {
      return res.status(400).json({ errors: ["You can't update the running service"] });
    }
    const service = await userService.updateServiceStatus(serviceId, status);
    return res
      .status(200)
      .json({ message: "Service status updated successfully"});
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};
