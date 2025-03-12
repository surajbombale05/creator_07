const crypto = require('crypto');
const axios = require('axios');
const moment = require('moment-timezone');
const PaymentData = require('../models/paymentDataModel');

async function createPayment2(order_id, amount, customer_mobile, customer_email, userId, subscriptionId) {
  console.log('Function Arguments:', { order_id, amount, customer_mobile, customer_email, userId, subscriptionId });
  const AuthID = process.env.AuthID;
  const AUTH_KEY = process.env.AuthKey;
  const IV = AUTH_KEY.substring(0, 16);
  const currentTimeIst = moment().tz("Asia/Kolkata");
  const date = currentTimeIst.format("YYYY-MM-DD HH:mm:ss");
  try {
    const payload = {
      "AuthID": AuthID,
      "AuthKey": AUTH_KEY,
      "CustRefNum": order_id,
      "txn_Amount": parseFloat(amount).toFixed(2),
      "PaymentDate": date,
      "ContactNo": customer_mobile,
      "EmailId": customer_email,
      "IntegrationType": "seamless",
      "CallbackURL": "https://api.creator07.com/app/skillpay/webhook",
      "adf1": "NA",
      "adf2": "NA",
      "adf3": "NA",
      "MOP": "UPI",
      "MOPType": "UPI",
      "MOPDetails": "I"
    };

    console.log(payload);

    const jsonString = JSON.stringify(payload);
    const encryptedData = encryptData(jsonString, AUTH_KEY, IV);
    const params = {
      AuthID: AuthID,
      encData: encryptedData
    };

    console.log(params);

    const response = await axios.post(
      'https://dashboard.skill-pay.in/pay/paymentinit',
      null,
      { params }
    );

    console.log(response);
    if (response.status === 200 && response.data.respData) {
      const decryptedData = decryptData(response.data.respData, AUTH_KEY, IV);
      const parsedResponse = JSON.parse(decryptedData);

      console.log(`user id :-   ${userId}`);
      console.log(`subscriptionId :- ${subscriptionId}`);

      // Extract necessary fields from response
      const paymentTransactionId = parsedResponse.TransactionId || "N/A";
      const paymentType = parsedResponse.PaymentMode || "UPI";
      const paymentStatus = "pending";

      const paymentDataResponse = await PaymentData.create({
        userId:userId,
        orderId:order_id,
        paymentTransactionId:paymentTransactionId,
        paymentType:paymentType,
        date:date,
        amount:parseFloat(amount).toFixed(2),
        paymentStatus:paymentStatus
     });
      return { status: true, message: 'payment intiliaze successfully', data: paymentDataResponse };
    } else {
      return { status: false, error: 'Invalid response from payment API', details: response.data };
    }


  } catch (error) {
    console.error('Error in createPayment2:', error);
    return error.response ? error.response.data : { error: 'Internal server error' };
  }
}

async function createPaymentRaw(order_id, amount, customerReferenceNumber, customer_name, customer_mobile, customer_email, paymentType, date, userId) {
  const AuthID = process.env.AuthID;
  const AUTH_KEY = process.env.AuthKey;
  const IV = AUTH_KEY.substring(0, 16);
  try {
    const payload = {
      "AuthID": AuthID,
      "AuthKey": AUTH_KEY,
      "CustRefNum": order_id,
      "txn_Amount": parseFloat(amount).toFixed(2),
      "PaymentDate": date,
      "ContactNo": customer_mobile,
      "EmailId": customer_email,
      "IntegrationType": "seamless",
      "CallbackURL": "https://dchart.site/api/webhook",
      "adf1": "NA",
      "adf2": "NA",
      "adf3": "NA",
      "MOP": "UPI",
      "MOPType": "UPI",
      "MOPDetails": "I"
    };

    const jsonString = JSON.stringify(payload);
    const encryptedData = encryptData(jsonString, AUTH_KEY, IV);
    const params = {
      AuthID: AuthID,
      encData: encryptedData
    };

    const response = await axios.post(
      'https://dashboard.skill-pay.in/pay/paymentinit',
      null,
      { params }
    );

    if (response.status === 200 && response.data.respData) {
      const decryptedData = decryptData(response.data.respData, AUTH_KEY, IV);
      const parsedResponse = JSON.parse(decryptedData);
      if (parsedResponse) {
        return {
          status: response.status,
          headers: response.headers,
          data: parsedResponse,
        };
      }
    }

    return {
      status: response.status,
      headers: response.headers,
      data: response.data,
    };
  } catch (error) {
    return {
      status: error.response ? error.response.status : 500,
      headers: error.response ? error.response.headers : {},
      data: error.response ? error.response.data : { error: "Internal server error" },
    };
  }
}

function encryptData(data, key, iv) {
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
  let encrypted = cipher.update(data, 'utf-8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

function decryptData(encryptedData, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
  let decrypted = decipher.update(encryptedData, 'base64', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
}


// Export the function
module.exports = { createPayment2, createPaymentRaw };