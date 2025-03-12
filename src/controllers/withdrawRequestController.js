const WithdrawRequest = require("../models/withdrawModel");
const User = require("../models/userModel");
const Transaction = require("../models/transactionModel");
const Setting = require("../models/paymentModel");
const BankDetails = require("../models/bankDetailsModel");
const { validationResult } = require("express-validator");
const {sendNotification} = require('../../utils/sendNotificationUtils')
const Notification = require('../models/notificationModel')
const moment = require("moment-timezone");
const { formatTimeToIST } = require("../../utils/dateUtils");

exports.getWithdrawRequestByUserId = async (req, res) => {
  const { userId } = req.body;
  try {
    const withdrawRequest = await WithdrawRequest.getWithdrawRequestsByUserId(
      userId
    );
    return res.status(200).json({status: true, msg: "Withdraw request fetched successfully", data: withdrawRequest});
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};

exports.createWithdrawRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  const { userId, amount, toAccount, reason } = req.body;
  try {
    const findUser = await User.findUserById(userId);
    if (!findUser) {
      return res.status(404).json({ status: false, errors: ["User not found"] });
    }
    if(findUser.status === 'block') {
      return res.status(400).json({ status: false, errors: ["User is blocked"] });
    }
    const currentTimeIst = moment().tz("Asia/Kolkata");
    const date = currentTimeIst.format("YYYY-MM-DD HH:mm:ss");
    const time = currentTimeIst.format('HH:mm:ss');
    const todayDay = currentTimeIst.format('dddd');
    const findSettingData = await Setting.findAllPayments();
    const startTime12 = moment(findSettingData[0].startTime, 'HH:mm').format('hh:mm A');
    const endTime12 = moment(findSettingData[0].endTime, 'HH:mm').format('hh:mm A');
    const data = findSettingData[0];
    if(data && data[todayDay]==='inactive'){
      return res.status(400).json({ status: false, error: `Withdrawal is not possible on ${todayDay}` });
    }
    if (
      moment(time, "HH:mm:ss").isSameOrBefore(
        moment(data.startTime, "HH:mm:ss")
      )
    ) {
      return res.status(400).json({ status: false, error: `withdraw time is between ${startTime12} to ${endTime12}` });
    }
    if (
      moment(time, "HH:mm:ss").isSameOrAfter(
        moment(data.endTime, "HH:mm:ss")
      )
    ) {
      return res.status(400).json({ status: false, error: `withdraw time is between ${startTime12} to ${endTime12}` });
    }
    if (amount > findUser.balance || findUser.balance <= 0) {
      return res.status(400).json({
        status: false,
        errors: [`Insufficient balance. the balance of user is ${findUser.balance}`], 
      });
    }

    const findBank = await BankDetails.findOneByUserId(userId);
    if (!findBank) {
      return res.status(200).json({ status: false, errors: ["Bank details not found"] });
    }
    const findPendingWithdraw = await WithdrawRequest.getPendingWithdrawRequests(userId,currentTimeIst.format('DD-MM-YYYY'));
    if (findPendingWithdraw.length > 0) {
      return res.status(200).json({ status: false, errors: ["you canot create a request until the previous request is approved"] });
    }

    const findCount = await WithdrawRequest.getAllWithdrawRequestsByDate(userId,currentTimeIst.format('DD-MM-YYYY'));
    if (findCount >= findSettingData[0].minimum_withdraw_daily_limit) {
      return res.status(200).json({ status: false, errors: ["your limit is up for today for creating request, please try tomorrow"] });
    }
    if (amount < findSettingData[0].withdrawMinimumLimitAmount) {
      return res.status(200).json({ status: false, errors: [`Minimum withdraw amount is ${findSettingData[0].withdrawMinimumLimitAmount}`] });
    }

    const withdrawRequest = await WithdrawRequest.create({
      userId,
      amount,
      toAccount,
      date,
    });
    const findUserBalance = await User.findUserById(userId);
    const newBalance = findUserBalance.balance;
    const newTransaction = await Transaction.create({
      userId,
      balance: newBalance,
      type: "debit",
      message: `Withdraw request created by ${findUser.firstName}${findUser.lastName} for rs.${amount} on ${date}`,
      transactionType: "withdrawDebitMoney",
      amount,
      date: date,
      reason: `Want To Withdraw Rs. ${amount} on ${date} from my account balance`,
      withdrawId: withdrawRequest.id,
    });
    return res.status(201).json({
      message: "Withdraw request created successfully",
      data: withdrawRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.deleteWithdrawRequest = async (req, res) => {
  const { id } = req.body;
  try {
    const withdrawRequest = await WithdrawRequest.deleteWithdrawRequest(id);
    if (!withdrawRequest) {
      return res.status(404).json({ errors: ["Withdraw request not found"] });
    }
    return res.status(200).json({
      message: "Withdraw request deleted successfully",
      data: withdrawRequest,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ errors: ['Something went wrong'] });
  }
};

exports.updateWithdrawRequestStatus = async (req, res) => {
  const requestId = req.params.id;
  const { status, reason } = req.body;
  try {
    const findWithdrawRequest = await WithdrawRequest.getWithdrawRequestsById(
      requestId
    );
    if (!findWithdrawRequest) {
      return res
        .status(404)
        .json({ status: false, errors: ["Withdraw request not found"] });
    }
    if(findWithdrawRequest.status === '1') {
      return res.status(400).json({ status: false, errors: [`Withdraw request already been accepted`] });
    }
    if(findWithdrawRequest.status === '-1') {
      return res.status(400).json({ status: false, errors: [`Withdraw request already been rejected`] });
    }
    const currentTimeIst = moment().tz("Asia/Kolkata");
    const dateString = currentTimeIst.format("DD-MM-YYYY");
    const timeString = currentTimeIst.format("HH:mm:ss");

    const withdrawRequest = await WithdrawRequest.updateWithdrawRequestStatus(
      requestId,
      status,
      dateString,
      timeString,
      reason
    );
    if (status === "-1") {
      const findUserBalance = await User.findUserById(
        findWithdrawRequest.userId
      );
      const newBalance = findUserBalance.balance;
      const newTransaction = await Transaction.create({
        userId: findWithdrawRequest.userId,
        balance: newBalance,
        transactionType: "withdrawAddMoney",
        message: `Withdraw money added to ${findUserBalance.firstName} ${findUserBalance.lastName} Wallet`,
        amount: findWithdrawRequest.amount,
        date: currentTimeIst.format("YYYY-MM-DD HH:mm:ss"),
        type: "add",
        reason: reason,
        withdrawId: requestId,
      });
    }
    const findDeviceToken = await User.findUserById(
      findWithdrawRequest.userId
    )
    if (status === "1") {
      await sendNotification(findDeviceToken.device_token,`Withdraw Request Update`,`Your withdraw request has been accepted for amount Rs. ${findWithdrawRequest.amount}`);
      const createWinningNotification = await Notification.create({
        userId: findWithdrawRequest.userId,
        requestId: findWithdrawRequest.id,
        actions: 'accept',
        creatorImagePath: findDeviceToken.profile_image,
        message: `Your withdraw request is accepted for amount Rs. ${findWithdrawRequest.amount}`,
        notificationType: 'creator',
        action_status: 'accept',
        amount: findWithdrawRequest.amount,
        date: formatTimeToIST().format('YYYY-MM-DD HH:mm:ss'),
        mobile: findDeviceToken.mobile
      }) 
      return res
        .status(200)
        .json({ message: "Withdraw request approved successfully" });
    }
    
    await sendNotification(findDeviceToken.device_token,`Withdraw Request Update`,`Your withdraw request has been rejected for amount Rs. ${findWithdrawRequest.amount}`);
    const createRejectNotification = await Notification.create({
      userId: findWithdrawRequest.userId,
      requestId: findWithdrawRequest.id,
      actions: 'reject',
      creatorImagePath: findDeviceToken.profile_image,
      message: `Your withdraw request is rejected for amount Rs. ${findWithdrawRequest.amount}`,
      notificationType: 'creator',
      action_status: 'reject',
      amount: findWithdrawRequest.amount,
      date: formatTimeToIST().format('YYYY-MM-DD HH:mm:ss'),
      mobile: findDeviceToken.mobile
    })
    return res
      .status(200)
      .json({ message: "Withdraw request rejected successfully" });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.getAllWithdrawRequest = async (req, res) => {
  const {userId, name, mobile, toAccount, date, amount, approvedDate, approvedTime, balance, status, reason, page} = req.body;
  try {
    const criteria = {
      userId,
      name,
      mobile,
      toAccount,
      date,
      amount,
      approvedDate,
      approvedTime,
      balance,
      status,
      reason
    }
    const withdrawRequest = await WithdrawRequest.searchWithdrawRequests(
      criteria,page
    )
    return res.status(200).json(withdrawRequest);
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};

