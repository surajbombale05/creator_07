const { body } = require('express-validator');

const createSavedTopicValidation = [
  body('userId').notEmpty().withMessage('userId is required').isInt().withMessage('userId must be an integer'),
  body('topicIds').notEmpty().withMessage('topicIds is required').isArray({ min: 1 }).withMessage('topicIds must be a non-empty array'),
  body('topicIds.*').isInt().withMessage('Each topicId must be an integer'),
];

module.exports = {
  createSavedTopicValidation,
};
