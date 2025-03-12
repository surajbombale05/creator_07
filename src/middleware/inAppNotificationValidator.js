const { body } = require("express-validator");

const updateInAppNotificationValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('url').optional().notEmpty().withMessage('Link is required'),
  body('scheduledDate').optional().notEmpty().withMessage('Scheduled date must be a valid'),
  body('scheduledTime').optional().notEmpty().withMessage('Scheduled time must be a valid')
]
const createInAppNotificationValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("message").trim().notEmpty().withMessage("Message is required"),
  body("userIds")
    .isArray({ min: 1 })
    .withMessage("At least one userId is required"),
  body("action")
    .trim()
    .notEmpty()
    .withMessage("Action is required")
    .isIn(["on", "off"])
    .withMessage('Action must be either "on" or "off"'),
  body("notification_type")
    .trim()
    .notEmpty()
    .withMessage("Notification type is required")
    .isIn(["notification", "update"])
    .withMessage('Notification type must be either "notification" or "update"'),
  body("playstore_url")
    .if(body("notification_type").equals("update")) // Apply validation only if notification_type is 'update'
    .notEmpty()
    .withMessage('playstore_url is required for notification type "update"'),
  body("ios_url")
    .if(body("notification_type").equals("update")) // Apply validation only if notification_type is 'update'
    .notEmpty()
    .withMessage('ios_url is required for notification type "update"'),
  body("android_min_version")
    .if(body("notification_type").equals("update")) // Apply validation only if notification_type is 'update'
    .notEmpty()
    .withMessage(
      'android_min_version is required for notification type "update"'
    ),
  body("android_curr_version")
    .if(body("notification_type").equals("update")) // Apply validation only if notification_type is 'update'
    .notEmpty()
    .withMessage(
      'android_curr_version is required for notification type "update"'
    ),
  body("ios_min_version")
    .if(body("notification_type").equals("update")) // Apply validation only if notification_type is 'update'
    .notEmpty()
    .withMessage('ios_min_version is required for notification type "update"'),
  body("ios_curr_version")
    .if(body("notification_type").equals("update")) // Apply validation only if notification_type is 'update'
    .notEmpty()
    .withMessage('ios_curr_version is required for notification type "update"'),
];


const validateFcmNotification = [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required'),
  body('notificationType').notEmpty().withMessage('Notification type is required'),
  body('notificationSentTo').notEmpty().withMessage('Notification sent to is required'),
  body('scheduledDate').optional().notEmpty().withMessage('Scheduled date must be a valid'),
  body('scheduledTime').optional().notEmpty().withMessage('Scheduled time must be a valid'),
  body('notificationType').custom((value, { req }) => {
    if (value === 'scheduled' && !req.body.scheduledDate && !req.body.scheduledTime) {
      throw new Error('Scheduled date and time is required when notification type is scheduled');
    }
    return true;
  }),
  body('notificationSentTo').custom((value, { req }) => {
    if (value === 'Individual' && (!req.body.userIds)) {
      throw new Error('User IDs are required when notification sent to is individual');
    }
    return true;
  })
];

const validateTempleteNotification = [
  body('notificationId').notEmpty().withMessage('Notification id is required'),
];


module.exports = {
  createInAppNotificationValidation,
  validateFcmNotification,
  validateTempleteNotification,
  updateInAppNotificationValidation
};
