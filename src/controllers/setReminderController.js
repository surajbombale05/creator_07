const { validationResult } = require("express-validator");
const setReminder = require("../models/setReminderModel");
const User = require("../models/userModel");
const { formatTimeToIST, generateNextDates } = require("../../utils/dateUtils");
const momment = require("moment-timezone");
const moment = require('moment-timezone');
const { scheduleNotifications } = require("../controllers/cronController");

exports.createRequest = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  const { userId, title, date, time, reminderType } = req.body;
  try {
    const findUserById = await User.findUserById(userId);
    if (!findUserById) {
      return res.status(404).json({ error: "User not found" });
    }

    const findSetReminder = await setReminder.findAllReminderByUserId(userId);
    if (findSetReminder.length > 8) {
      return res.status(400).json({
        errors: ["You can only set maximum of 8 reminders for each user"],
      });
    }
    const formattedTime = momment(time,"hh:mm a").format("HH:mm:ss");
    const findAllReminderByUserId = await setReminder.findAllReminderByUserId(
      userId
    )
    const findDublicateTime = findAllReminderByUserId.find(reminder => {
      return reminder.time === formattedTime
    })

    if (findDublicateTime) {
      return res.status(400).json({
        errors: ["Reminder already exists for this user on this time"]
      });
    }
    const newReminder = await setReminder.createReminder({
      userId,
      title,
      date,
      time: formattedTime,
      reminderType
    });

    return res
      .status(200)
      .json({ message: "Reminder created successfully", data: newReminder });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.getAllReminder = async (req, res) => {
  try {
    const topics = await setReminder.findAllReminder();
    return res.status(200).json({ message: "List Of All Reminders", data: topics });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.getAllReminderByUserId = async (req, res) => {
    const { userId } = req.body;
    try {
      const findCurrentDate = formatTimeToIST().format('YYYY-MM-DD HH:mm:ss');
        let data = await setReminder.findAllReminderByUserId(userId);
        data = data.filter(reminder => {
          if (reminder.reminderType === 'Once') {
              const reminderDateTime = moment(`${reminder.date} ${reminder.time}`, 'YYYY-MM-DD HH:mm:ss');
              return reminderDateTime.isSameOrAfter(findCurrentDate);
          }
          return true; 
      });

      data = data.map(reminder => {
        if (reminder.reminderType !== "Once") {
            const nextDates = generateNextDates(reminder.reminderType, reminder.date);
            return {
                ...reminder,
                nextDates: nextDates
            };
        } else {
            return reminder;
        }
    });

        return res.status(200).json({ message: "List Of All Reminders of the User", data: data });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ["Something went wrong"] });
    }
};


exports.updateReminderAction = async (req, res) => {
  const { reminderId, status} = req.body;
  try {
    const reminder = await setReminder.findReminderById(reminderId);
    if (!reminder) {
      return res.status(404).json({ errors: ["Reminder not found"] });
    }

    const updatedReminder = await setReminder.updateAction(reminderId, status);
    return res
      .status(200)
      .json({ message: "Reminder updated successfully", data: updatedReminder });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};


exports.deleteReminder = async (req, res) => {
  const reminderId = req.params.id;
  try {
    const reminder = await setReminder.findReminderById(reminderId);
    if (!reminder) {
      return res.status(404).json({ errors: ["Reminder not found"] });
    }
    const deletedReminder = await setReminder.deleteReminder(reminderId);
    return res
      .status(200)
      .json({ message: "Reminder deleted successfully", data: deletedReminder });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};
