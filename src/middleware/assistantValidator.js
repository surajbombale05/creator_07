const { body } = require('express-validator');

const createOpenAiDataValidation = [
  body('userId').isInt().withMessage('Invalid user ID'),
  body('type').isIn(['user', 'bot']).withMessage('Invalid type'),
  body('message').isString().notEmpty().withMessage('Message cannot be empty'),
];

module.exports = {
  createOpenAiDataValidation,
};