const Razorpay = require("razorpay");
const createOrder = require("../models/razorpay_order_model");
require("dotenv").config();
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
    const { amount, currency = "INR" } = req.body;

    try {
        const order = await razorpay.orders.create({
            amount: amount * 100,
            currency,
        });

        const newOrder = await createOrder.createOrder({
            orderId: order.id,
            amount,
            currency,
            status: "created",
        });

        res.status(200).json({ status: true, order: newOrder });
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: false, message: "Order creation failed", error });
    }
};