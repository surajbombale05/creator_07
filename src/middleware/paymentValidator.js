const { body } = require("express-validator");

const createRequestValidation = [
    body("payment_method")
        .trim()
        .notEmpty().withMessage("payment_method is required")
        .custom((value) => {
            const allowedMethods = ['razorpay', 'cashfree', 'upi_id', 'phonepay'];
            if (!allowedMethods.includes(value)) {
                throw new Error('Invalid payment method');
            }
            return true;
        }),
    body("bankname").trim().notEmpty().withMessage("bankname is required"),
    body("account_holder_name").trim().notEmpty().withMessage("account_holder_name is required"),
    body("account_number").trim().notEmpty().withMessage("account_number is required"),
    body("ifsc_code").trim().notEmpty().withMessage("ifsc_code is required"),
    body("upi_id").trim().notEmpty().withMessage("upi_id is required"),
    body("orderId")
        .if(body("payment_method").equals("cashfree"))
        .notEmpty().withMessage("orderId is required"),
    body("payment_session_id")
        .if(body("payment_method").equals("cashfree"))
        .notEmpty().withMessage("payment_session_id is required"),
];


  const updateRequestValidation = [
    body("payment_method").optional().trim().custom((value) => {
        if (!['razorpay', 'cashfree', 'upi_id'].includes(value)) {
            throw new Error('Invalid payment method. Allowed methods are razorpay, cashfree, and upi_id');
        }
        return true;
    }),
    body("bankname").optional().trim().notEmpty().withMessage("bankname cannot be empty"),
    body("account_holder_name").optional().trim().notEmpty().withMessage("account_holder_name cannot be empty"),
    body("account_number").optional().trim().notEmpty().withMessage("account_number cannot be empty"),
    body("ifsc_code").optional().trim().notEmpty().withMessage("ifsc_code cannot be empty"),
    body("upi_id").optional().trim().notEmpty().withMessage("upi_id cannot be empty"),
    body("active").optional().trim().custom((value) => {
        if (!['on', 'off'].includes(value)) {
            throw new Error('Invalid value for active field. Allowed values are on and off');
        }
        return true;
    })
];


module.exports = {
    createRequestValidation,
    updateRequestValidation
}
  