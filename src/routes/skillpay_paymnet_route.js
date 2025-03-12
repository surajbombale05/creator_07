const express = require('express');
const urlencodedMiddleware = express.urlencoded({ extended: true });
const router = express.Router();
const { createPayment2 } = require('../controllers/skill_pay_controller');
const { getSkillPaymentDetails,initiatepayment } = require('../controllers/skillpay_webhook_controller');

// Define the route
router.post('/skill-pay', async (req, res) => {
    try {
        const { amount, customer_mobile, customer_email, order_id, userId} = req.body;
     
        const paymentResponse = await createPayment2(
            order_id,
            amount,
            customer_mobile,
            customer_email,
            userId
        );
        console.log(`new reqqqqqqqqqqqqqqq ${userId}`);
        res.status(200).json(paymentResponse);
    } catch (error) {
        res.status(500).json({ status: false, message: 'Payment creation failed', error: error.message });
    }
});

// webhooks routes

router.post('/webhook', urlencodedMiddleware, getSkillPaymentDetails);

// api forwarding
router.post('/forwarding/initiatepayment', initiatepayment);

module.exports = router;

