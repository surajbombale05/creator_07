const { body } = require("express-validator");

const createReminderValidation = [
    body("userId").trim().notEmpty().withMessage("userId is required"),
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("date")
    .trim()
    .notEmpty()
    .withMessage("Date is required")
    .isISO8601()
    .withMessage("Invalid date format. Date should be in ISO8601 format (YYYY-MM-DD)"),
  
  body("time")
    .trim()
    .notEmpty()
    .withMessage("Time is required"),

    body('reminderType').trim().notEmpty().withMessage('Reminder type is required').isIn(['Once','EveryDay','Every2ndDay','Every3rdDay','Every4thDay','Every5thDay','EveryWeek']).withMessage('Invalid reminder type. Accepted values are Once, EveryDay, Every2ndDay, Every3rdDay, Every4thDay, Every5thDay, EveryWeek.'),

];


module.exports = {
    createReminderValidation
}