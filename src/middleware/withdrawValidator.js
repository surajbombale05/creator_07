const { body } = require('express-validator');

const validateWithdrawRequestCreation = [
    body('amount').notEmpty().withMessage('Amount is required').isInt({ min: 1 }).withMessage('Amount must be a positive integer'),
    body('toAccount').notEmpty().withMessage('To account is required').isString().withMessage('To account must be a string'),
    body('userId').notEmpty().withMessage('User ID is required'),
    body('reason').notEmpty().withMessage('Reason is required').isString().withMessage('Reason must be a string'),
    body('approvedDate').optional().notEmpty().withMessage('Approved date is required'),
    body('approvedTime').optional().isString().withMessage('Approved time must be a string'),
];

module.exports = {
    validateWithdrawRequestCreation
}