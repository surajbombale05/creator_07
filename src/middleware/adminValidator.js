const { body} = require('express-validator');


const validateCreateAdmin = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('mobile').trim().notEmpty().withMessage('Mobile is required'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
  body('password').trim().notEmpty().withMessage('Password is required'),
];



module.exports = {
  validateCreateAdmin
}