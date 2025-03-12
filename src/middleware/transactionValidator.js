const { body } = require('express-validator');

const createTransaction = [
    body('requestId').notEmpty().withMessage('Request ID is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required'),
    body('paymentMethod').isIn(['cashfree', 'upi_id', 'phonepe', 'razorpay']).withMessage('Invalid payment method'),
    body('paymentStatus').notEmpty().withMessage('Payment status is required'),
    body('paymentStatus').isIn(['success', 'failure']).withMessage('Invalid payment status'),
    body('amount').notEmpty().withMessage('Amount is required').isInt().withMessage('Amount must be an integer')
];

module.exports = {
    createTransaction
};
