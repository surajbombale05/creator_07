const moment = require('moment-timezone');
const feedBack = require('../src/models/feedbackModel');
const momment = require('moment-timezone');

function formatTimeToIST() {
  const timeInIST = moment().tz('Asia/Kolkata');
  return timeInIST;
}

function formatDateUTC(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}


function getExpryDate(serviceType) {
  const timeInIST = moment().tz('Asia/Kolkata');
  if(serviceType === '/day') {
    return timeInIST.add(1, 'days').format('YYYY-MM-DD HH:mm:ss');
  }
  if(serviceType === '/month') {
    return timeInIST.add(1, 'months').format('YYYY-MM-DD HH:mm:ss');
  }
  if(serviceType === '/year') {
    return timeInIST.add(1, 'years').format('YYYY-MM-DD HH:mm:ss');
  }
}


 async function calculateStars(userId){
  const feedback =  await feedBack.getAllReviewUserId(userId);
  const totalRating = feedback.reduce((acc, feedback) => acc + feedback.rating, 0);
  const averageRating = totalRating / feedback.length;
  const starRanges = [
    { min: 0, max: 10, stars: 1 },
    { min: 11, max: 20, stars: 1.5 },
    { min: 21, max: 30, stars: 2 },
    { min: 31, max: 40, stars: 2.5 },
    { min: 41, max: 50, stars: 3 },
    { min: 51, max: 60, stars: 3.5 },
    { min: 61, max: 70, stars: 4 },
    { min: 71, max: 80, stars: 4.5 },
    { min: 81, max: 100, stars: 5 },
    { min:101, max: Infinity, stars: 5 },
  ];


let stars = 0;
    for (const range of starRanges) {
        if (totalRating >= range.min && totalRating <= range.max) {
            stars = range.stars;
            break;
        }
    }

    return stars;
}


function generateNextDates(reminderType, startDate) {
  const nextDates = [];
  let currentDate = moment(startDate).startOf('day');
  switch (reminderType) {
      case "EveryDay":
          while (currentDate.month() === moment(startDate).month()) {
              nextDates.push(currentDate.date());
              currentDate.add(1, 'day');
          }
          break;
      case "Every2ndDay":
          while (currentDate.month() === moment(startDate).month()) {
              nextDates.push(currentDate.date());
              currentDate.add(2, 'day');
          }
          break;
      case "Every3rdDay":
          while (currentDate.month() === moment(startDate).month()) {
              nextDates.push(currentDate.date());
              currentDate.add(3, 'day');
          }
          break;
      case "Every4thDay":
          while (currentDate.month() === moment(startDate).month()) {
              nextDates.push(currentDate.date());
              currentDate.add(4, 'day');
          }
          break;
      case "Every5thDay":
          while (currentDate.month() === moment(startDate).month()) {
              nextDates.push(currentDate.date());
              currentDate.add(5, 'day');
          }
          break;
      case "EveryWeek":
          while (currentDate.month() === moment(startDate).month()) {
              nextDates.push(currentDate.date());
              currentDate.add(7, 'day');
          }
          break;
      default:
          break;
  }
  return nextDates;
}


function getNotificationTypeDate(notificationSentTo) {
  if (notificationSentTo === 'Yesterday') {
    return moment().subtract(1, 'days').format('YYYY-MM-DD');
  } else if (notificationSentTo === 'last15Days') {
    return moment().subtract(15, 'days').format('YYYY-MM-DD');
  } else if (notificationSentTo === 'lastMonth') {
    return moment().subtract(30, 'days').format('YYYY-MM-DD');
  } else if (notificationSentTo === 'last10Days') {
    return moment().subtract(10, 'days').format('YYYY-MM-DD');
  } else if (notificationSentTo === 'last5Days') {
    return moment().subtract(5, 'days').format('YYYY-MM-DD');
  } else if (notificationSentTo === 'last2Days') {
    return moment().subtract(2, 'days').format('YYYY-MM-DD');
  } else {
    return moment().format('YYYY-MM-DD');
  }
}

function getMonthName(monthNumber) {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[monthNumber];
}

function getMonthlyDateRanges(year) {
  let months = [];
  for (let i = 0; i < 12; i++) {
    let startOfMonth = moment().tz('Asia/Kolkata').year(year).month(i).startOf('month').format('YYYY-MM-DD');
    let endOfMonth = moment().tz('Asia/Kolkata').year(year).month(i).endOf('month').format('YYYY-MM-DD');
    months.push({ startOfMonth, endOfMonth });
  }
  return months;
}


module.exports = { formatDateUTC, formatTimeToIST, getExpryDate, calculateStars, generateNextDates, getNotificationTypeDate, getMonthlyDateRanges, getMonthName };