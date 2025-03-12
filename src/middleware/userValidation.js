const { body } = require('express-validator');

const createUserValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('password').notEmpty().withMessage('Password is required'),
  body('mobile')
    .notEmpty().withMessage('Mobile is required')
    .isNumeric().withMessage('Mobile must be a number')
    .isLength({ min: 10, max: 10 }).withMessage('Mobile must be 10 digits'),
 // body('device_token').optional().withMessage('Device token is required')
];


const LoginUserValidation = [
        body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
        body('password').notEmpty().withMessage('Password is required'),
     //   body('device_token').optional().withMessage('Device token is required')
];

const checkFile = (value, { req }) => {
  // If profile_image is selected but empty, return an error
  if (req.file && (!req.file.buffer || req.file.buffer.length === 0)) {
    throw new Error('Profile image file cannot be empty.');
  }
  return true;
};
const checkWorkFile = (value, { req }) => {
  // If profile_image is selected but empty, return an error
  if (req.file && (!req.file.buffer || req.file.buffer.length === 0)) {
    throw new Error('Work image file cannot be empty.');
  }
  return true;
};
const updateUserValidation = [
  body("firstName").optional().trim().notEmpty().withMessage("First name is required"),
  body("lastName").optional().trim().notEmpty().withMessage("Last name is required"),
  body("email").optional().trim().notEmpty().withMessage("Email is required"),
  body("password").optional().trim().notEmpty().withMessage("Password is required"),
  body("mobile").optional().trim().notEmpty().withMessage("Mobile is required"),
  body("fullname").optional().trim().notEmpty().withMessage("Name is required"),
  body("state").optional().trim().notEmpty().withMessage("State is required"),
  body("city").optional().trim().notEmpty().withMessage("City is required"),
  body("price").optional().trim().notEmpty().withMessage("Price is required"),
  body("star")
    .optional()
    .trim()
    .notEmpty().withMessage("Star rating is required")
    .isInt({ min: 1, max: 5 }).withMessage("Star rating must be between 1 and 5"),
  // body("about").optional().trim().notEmpty().withMessage("About is required"),
  // body('profile_image').optional().custom(checkFile),
  // body('work_image').optional().custom(checkWorkFile),
  // body("work_video").optional().trim().notEmpty().withMessage("Work video is required"),
  // body("language").optional().trim().notEmpty().withMessage("Language is required"),
  // body("timeline").optional().trim().notEmpty().withMessage("Timeline is required"),
  // body("responseTime").optional().trim().notEmpty().withMessage("Response time is required"),
  // body("instagramUrl").optional().trim().notEmpty().withMessage("Instagram URL is required"),
  // body("twitterUrl").optional().trim().notEmpty().withMessage("Twitter URL is required"),
  // body("youtubeUrl").optional().trim().notEmpty().withMessage("YouTube URL is required"),
  // body("facebookUrl").optional().trim().notEmpty().withMessage("Facebook URL is required"),
  // body("edited").optional().isIn(['extra charges', 'included']).withMessage("Invalid value for 'edited'. Accepted values are 'extra charges' or 'included'."),
  // body("thumbnail").optional().isIn(['extra charges', 'included']).withMessage("Invalid value for 'thumbnail'. Accepted values are 'extra charges' or 'included'."),
];

const updateIsCreator = [
  body('is_creator')
  .notEmpty().withMessage('is_creator is required')
  .isBoolean().withMessage('is_creator must be a boolean (true or false)')

];

const updateIsCollaborator = [
  body('is_collaborator')
  .notEmpty().withMessage('is_collaborator is required')
  .isBoolean().withMessage('is_collaborator must be a boolean (true or false)')

];

const updateCollaborator = [
      body('channelName').notEmpty().withMessage('Channel name is required'),
      body('subscribers').notEmpty().withMessage('subscribers is required'),
      body('categoryId').notEmpty().withMessage('category Id is required')
]
module.exports = {
  createUserValidation,
  LoginUserValidation,
  updateUserValidation,
  updateIsCreator,
  updateIsCollaborator,
  updateCollaborator
};
