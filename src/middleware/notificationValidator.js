const { body } = require("express-validator");

const createNotificationValidation = [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("message").trim().notEmpty().withMessage("Message is required"),
    body("userType").trim().notEmpty().withMessage("User type is required").isIn(['all', 'creator', 'user']).withMessage("Invalid user type"),
    body("dateRange").trim().notEmpty().withMessage("Date range is required").isIn(['last_24_days', 'last_10_days', 'last_5_days', 'yesterday', 'today', 'last_2_hour', 'last_1_hour']).withMessage("Invalid date range"),
  ];
  



module.exports = {
    createNotificationValidation
}