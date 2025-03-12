const axios = require('axios');
const { body } = require('express-validator');
require('dotenv').config();
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const keyfilepath = path.resolve(__dirname, '../config/creator07-mt-firebase-adminsdk-8gpod-025ca2b5be.json');

async function getAccessToken() {
  const auth = new GoogleAuth({
    keyFile: keyfilepath,
    scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
  });

  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();
  return accessToken.token;
}

async function sendNotification(deviceToken, title, body, url, image) {
  try {
    const accessToken = await getAccessToken(); // Get OAuth token

    const payload = {
      "message": {
        "token": deviceToken,
        "notification": {
          "title": title,
          "body": body,
          "image": image ? `http://139.59.12.22:3050${image}` : undefined
        },
        "data": {
          "click_action": "FLUTTER_NOTIFICATION_CLICK",
          "id": "1",
          "status": "done",
          ...(url ? { "link": url } : {}) 
        }
      }
    };

    const response = await axios.post(
      `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`,
      payload,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log('Notification sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending notification:', error.response?.data || error.message);
    throw error;
  }
}

  async function sendNotificationMulticast(deviceToken,title,body,url,image,messageId) {
    try {
      const notificationPayload = {
        "title": `${title}`,
        "body": `${body}`,
        "sound": "default",
      };
      if(image){
        notificationPayload.content_available = "true";
        notificationPayload.image = `http://139.59.12.22:3050${image}`;
      }
      const payload = {
        "notification": notificationPayload,
        "priority": 'high',
        "data": {
          "click_action": 'FLUTTER_NOTIFICATION_CLICK',
          "id": '1',
          "status": 'done',
        },
        "to": deviceToken,
      };

      if (url) {
        payload.data.link = url;
    }
    payload.data.messageId = messageId
    console.log(payload);
      const response = await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        payload,
        {
          headers: {
            "Authorization": `key=${process.env.Firebase_Key}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
  
      console.log('Notification sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error.response.data);
      throw error;
    }
  } 

  async function sendNotificationToMultiUsers(title,body,url,image,deviceTokens) {
    try {
      const notificationPayload = {
        "title": `${title}`,
        "body": `${body}`,
        "sound": "default",
      };
      if(image){
        notificationPayload.content_available = "true";
        notificationPayload.image = `http://139.59.12.22:3050${image}`;
      }
      const payload = {
        "notification": notificationPayload,
        "priority": 'high',
        "data": {
          "click_action": 'FLUTTER_NOTIFICATION_CLICK',
          "id": '1',
          "status": 'done',
        },
        "registration_ids": deviceTokens,
      };

      if (url) {
        payload.data.link = url;
      }
      const response = await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        payload,
        {
          headers: {
            "Authorization": `key=${process.env.Firebase_Key}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
  
      console.log('Notification sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error.response.data);
      throw error;
    }
  } 
  
  async function sendNotificationToAll(title,body,url,image,messageId) {
    try {
      const notificationPayload = {
        "title": `${title}`,
        "body": `${body}`,
        "sound": "default",
      };
      if(image){
        notificationPayload.content_available = "true";
        notificationPayload.image = `http://139.59.12.22:3050${image}`;
      }
      const payload = {
        "notification": notificationPayload,
        "priority": 'high',
        "data": {
          "click_action": 'FLUTTER_NOTIFICATION_CLICK',
          "id": '1',
          "status": 'done',
          "messageId": messageId
        },
        "to": '/topics/all',
      };

      if (url) {
        payload.data.link = url;
    }
      const response = await axios.post(
        'https://fcm.googleapis.com/fcm/send',
        payload,
        {
          headers: {
            "Authorization": `key=${process.env.Firebase_Key}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
  
      console.log('Notification sent successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error.response.data);
      throw error;
    }
  }
  module.exports = {
    sendNotification,
    sendNotificationMulticast,
    sendNotificationToAll,
    sendNotificationToMultiUsers
  }