const Payment = require("../models/paymentModel");
const User = require("../models/userModel");
const { validationResult } = require("express-validator");
const {formatTimeToIST} = require('../../utils/dateUtils');
const moment = require('moment-timezone');
const path = require('path');

exports.createPayment = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  const {
    payment_method,
    bankname,
    account_holder_name,
    account_number,
    ifsc_code,
    upi_id,
    interstitial_ad_details_key,
    topic_ad_details_key,
    notification_ad_details_key,
    home_details_ad_key_1,
    home_details_ad_key_2,
    home_details_ad_key_3,
    active,
    orderId,
    payment_session_id
  } = req.body;
  try {
    const findAccountNumber = await Payment.findPaymentByAccountNumber(
      account_number
    );
    if (findAccountNumber) {
      return res.status(400).json({ error: "Account number already exists" });
    }
    const newPaymentRequest = await Payment.create({
      payment_method,
      bankname,
      account_holder_name,
      account_number,
      ifsc_code,
      upi_id,
      active,
      interstitial_ad_details_key,
      topic_ad_details_key,
      notification_ad_details_key,
      home_details_ad_key_1,
      home_details_ad_key_2,
      home_details_ad_key_3,
      orderId,
      payment_session_id
    });
    const findPaymentById = await Payment.findPaymentByAccountNumber(
      account_number
    );
    return res
      .status(200)
      .json({ message: "create Setting", data: findPaymentById });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getSetting = async (req, res) => {
  try {
    const findPaymentById = await Payment.findAllPayments();
    if (findPaymentById.length === 0) {
      return res.status(404).json({ error: "Setting not found" });
    }

    if (findPaymentById[0].active === "off") {
      findPaymentById[0].interstitial_ad_details_key = null;
      findPaymentById[0].banner_ad_details_key = null;
      findPaymentById[0].native_ad_details_key = null;
      findPaymentById[0].reward_details_ad_key = null;
      findPaymentById[0].home_details_ad_key_2 = null;
      findPaymentById[0].home_details_ad_key_3 = null;
    }

    return res
      .status(200)
      .json({ message: "user Setting", data: findPaymentById });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteSetting = async (req, res) => {
  const paymentId = req.params.id;
  try {
    const success = await Payment.deletePayment(paymentId);
    if (!success) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json({ message: "Payment deleted successfully", success: success });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateSetting = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  
  const paymentId = req.params.id;
  const {
    payment_method,
    bankname,
    account_holder_name,
    account_number,
    active,
    ifsc_code,
    upi_id,
    interstitial_ad_details_key,
    banner_ad_details_key,
    native_ad_details_key,
    reward_details_ad_key,
    home_details_ad_key_2,
    home_details_ad_key_3,
    playstore_url,
    version,
    creator_native_id,
    dashboard_native_id,
    collab_native_id,
    home_native_id,
    term_and_cond,
    privacy_policy,
    about_us,
    phone_pay_key,
    razorpay_secret_key,
    razorpay_id,
  } = req.body;

  try {
    const success = await Payment.updatePayment(paymentId, {
      payment_method,
      bankname,
      account_holder_name,
      account_number,
      active,
      ifsc_code,
      upi_id,
      interstitial_ad_details_key,
      banner_ad_details_key,
      native_ad_details_key,
      reward_details_ad_key,
      home_details_ad_key_2,
      home_details_ad_key_3,
      playstore_url,
      version,
      creator_native_id,
      dashboard_native_id,
      collab_native_id,
      home_native_id,
      term_and_cond,
      privacy_policy,
      about_us,
      phone_pay_key,
      razorpay_secret_key,
      razorpay_id,
    });
    
    if (!success) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    const findUpdatedPayment = await Payment.findPaymentById(paymentId);
    res.json({
      message: "Payment updated successfully",
      success: findUpdatedPayment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getGoogleAdds = async (req, res) => {
  try {
    const ads = await Payment.findAllPayments();
    if (ads.length === 0) {
      return res.status(404).json({ error: "Ads not found" });
    }
    const data = {
      Interstitial_Ad: ads[0].interstitial_ad_details_key,
      Banner_Ad: ads[0].banner_ad_details_key,
      Native_Ad: ads[0].native_ad_details_key,
      Rewarded_Ad: ads[0].reward_details_ad_key,
    }
    return res
      .status(200)
      .json({ status: true, message: "Ads found", data: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
}
}


exports.updateAdSetting = async (req, res) => {
  const paymentId = req.params.id;
  const {
    interstitial_ad,
    banner_ad,
    native_ad,
    rewarded_ad,
  } = req.body;
  try {
    const success = await Payment.updateGoogleAdds(paymentId, {
      interstitial_ad_details_key: interstitial_ad,
      banner_ad_details_key: banner_ad,
      native_ad_details_key: native_ad,
      reward_details_ad_key: rewarded_ad,
    });
    const findUpdatesPyment = await Payment.findPaymentById(paymentId);
    res.json({
      message: "Ads updated successfully",
      success: findUpdatesPyment,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


exports.updateMimimumLimits = async (req, res) => {
  const paymentId = req.params.id;
  let vedio;
  const {
    withdrawMinimumLimitAmount,
    minimum_withdraw_daily_limit,
    startTime,
    endTime,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    searchType,
    verificationText,
    verificationVedioLink
  } = req.body;
  try {
    let formattedstartTime;
    let formattedendTime;
    if(startTime){
      formattedstartTime = moment(startTime, "hh:mm a").format(
        "HH:mm:ss"
      );
    }

    if(endTime){
      formattedendTime = moment(endTime, "hh:mm a").format(
        "HH:mm:ss"
      );
    }
    if(req.file){
      let workImagePath = req.file.path.replace(/\\/g, "/");
      vedio = "/" + path.basename(workImagePath);
    }
    const success = await Payment.updateMinimumLimitAmount(paymentId, {
      withdrawMinimumLimitAmount,
      minimum_withdraw_daily_limit,
      startTime: formattedstartTime,
      endTime: formattedendTime,
      Monday,
      Tuesday,
      Wednesday,
      Thursday,
      Friday,
      Saturday,
      searchType,
      verificationText,
      verificationVedioLink: vedio
    });
    const findUpdatesPyment = await Payment.findPaymentById(paymentId);
    res.json({
      message: "Ads updated successfully",
      success: findUpdatesPyment,
    });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
}


exports.updatePayment = async (req, res) => {
  const paymentId = req.params.id;
  const {
    type,
    cashfree_X_Client_Secret,
    cashfree_X_Client_Id,
    upiId,
    razorpay_key,
  } = req.body;
  try {
    if(type==='cashfree'){
      const success = await Payment.updatePaymentOptions(type,cashfree_X_Client_Secret,cashfree_X_Client_Id,null,null);
    }else if(type==='razorpay'){
      const success = await Payment.updatePaymentOptions(type,null,null,null,razorpay_key);
    }else if(type==='upi'){
      const success = await Payment.updatePaymentOptions(type,null,null,upiId,null);
    }
    const findUpdatesPyment = await Payment.findPaymentById(paymentId);
    return res.status(200).json({ message: "Payment updated successfully", success: findUpdatesPyment });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
}


exports.getCurrentPaymentOption = async (req, res) => {
  const { paymentId, type } = req.body;
  try {
    const payment = await Payment.findPaymentById(paymentId);
    let data;
    if(type==='cashfree'){
      data = {
        cashfree_X_Client_Secret: payment.cashfree_X_Client_Secret,
        cashfree_X_Client_Id: payment.cashfree_X_Client_Id,
        status: payment.payment_method === 'cashfree' ? '1' : '0'
      }
    }else if(type==='razorpay'){
      data = {
        razorpay_key: payment.razorpay_key,
        status: payment.payment_method === 'razorpay' ? '1' : '0'
      }
    }else if(type==='upi'){
      data = {
        upiId: payment.upiId,
        status: payment.payment_method === 'upi_id' ? '1' : '0'
      }
    }
    return res.status(200).json({ message: "Payment updated successfully", success: data });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
}



exports.getDetailsOfVerification = async (req, res) => {
  try{
    const getPayment = await Payment.findAllPayments();
    const data = {
       verficationText : getPayment[0].verificationText,
       verfificationLink : getPayment[0].verificationVedioLink
    }
    return res.status(200).json({ success: data });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
}