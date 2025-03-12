// Required modules
const express = require('express');
const dotenv = require('dotenv');
const crypto = require('crypto');
const axios = require('axios');
const moment = require('moment-timezone');
// const User = require('../models/user_model');
const PaymentData = require('../models/paymentDataModel');
const ServerLog = require('../models/serverlog_model');
const { createPaymentRaw } = require('../controllers/skill_pay_controller');

dotenv.config();

const app = express();
const router = express.Router();

app.use(express.json());

exports.getSkillPaymentDetails = async (req, res) => {
    const { AuthID, respData } = req.body;
    const resonseData=  JSON.stringify(req.body);
    const dataVaule = await ServerLog.createServerLog({ encodedResponse : resonseData });
    
    const AUTH_KEY = process.env.AuthKey;
    const IV = AUTH_KEY.substring(0, 16);

    try {
        // Validate respData
        // if (!respData) {
        //     console.error("Missing respData in request body");
        //     return res.status(400).json({ error: "Missing respData in request body" });
        // }

        // Decrypt and parse respData
        const formattedRespData = respData.replace(/ /g, '+');
        const decryptedData = decryptData(formattedRespData, AUTH_KEY, IV);
        const parsedResponse = JSON.parse(decryptedData);
        const { CustRefNum, payStatus, resp_code, resp_message } = parsedResponse;

        const encodedResponse = JSON.stringify(parsedResponse);
        const serverLog = await ServerLog.createServerLog({ encodedResponse : encodedResponse });

        if (parsedResponse && CustRefNum) {
            const orderIdx = CustRefNum;
            if (orderIdx.endsWith('_guujupride')) {
              const forwardingResponse = await axios.post(
                'https://api.guuju.store/payment/callbackPayment/forwarding/skillpayPayment',
                parsedResponse,
                {
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              );
      
              return res.status(forwardingResponse.status).json(forwardingResponse.data);
            }
        }
        return;

        // Fetch payment data by order ID
        const paymentRecord = await PaymentData.findOne({
            where: { order_id: CustRefNum },
        });

        if (!paymentRecord) {
            console.error(`No payment record found for Order ID: ${CustRefNum}`);
            return res.status(404).json({ error: "Payment record not found" });
        }

        if (paymentRecord.status === "success" || paymentRecord.status === "failure") {
            console.log(`Payment already processed for Order ID: ${CustRefNum}`);
            return res.status(200).json({ 
                status: false, 
                msg: "Payment already processed" 
            });
        }

        if (payStatus === "Ok" && resp_code === "00000") {
            console.log("Payment successful.");

            await User.update(
                {
                    is_paid_member: true,
                    subscriptionId: subscription_id || null, // Update subscriptionId
                    join_date: moment().format("YYYY-MM-DD") // Set join_date to today's date
                },
                { where: { id: paymentRecord.userId } }
            );

            await PaymentData.update(
                { status: "success" },
                { where: { order_id: CustRefNum } }
            );

            console.log(`Payment marked as success for Order ID: ${CustRefNum}`);
        } else {
            console.error(`Payment failed for Order ID: ${CustRefNum}. Reason: ${resp_message}`);

            await PaymentData.update(
                { status: "failure" },
                { where: { order_id: CustRefNum } }
            );
        }

        
        return res.status(200).json({
            status: true,
            msg: "Payment data processed successfully",
            data: serverLog,
        });

    } catch (error) {
        console.error("Error processing payment callback:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

exports.initiatepayment = async (req, res) => {
    const { orderId, req_amount, customerRef, customerName, customerMobile, customerEmail, userId } = req.body;
    const currentTimeIst = moment().tz("Asia/Kolkata");
    try {
        const payData = {
            order_id: orderId,
            amount: req_amount,
            customerReferenceNumber: customerRef,
            customer_name: customerName,
            customer_mobile: customerMobile,
            customer_email: customerEmail,
            paymentType: 'upiMoney',
            date: currentTimeIst.format('YYYY-MM-DD HH:mm:ss'),
            userId: userId,
        };

        const gatewayResponse = await createPaymentRaw(
            payData.order_id,
            payData.amount,
            payData.customerReferenceNumber,
            payData.customer_name,
            payData.customer_mobile,
            payData.customer_email,
            payData.paymentType,
            payData.date,
            payData.userId
        );
        res.status(gatewayResponse.status)
        .set({
            'Content-Type': 'application/json',
            ...filterHeaders(gatewayResponse.headers)
        })
        .json(gatewayResponse.data);

    } catch (error) {
        console.error('Error forwarding request:', error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

function filterHeaders(headers) {
    const allowedHeaders = ['x-request-id', 'x-correlation-id', 'content-type'];
    return Object.fromEntries(
      Object.entries(headers).filter(([key]) =>
        allowedHeaders.includes(key.toLowerCase())
      )
    );
}

function decryptData(encryptedData, key, iv) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), Buffer.from(iv));
    let decrypted = decipher.update(encryptedData, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}
