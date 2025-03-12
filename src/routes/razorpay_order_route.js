const express = require("express");
const router = express.Router();
const razorpayOrderController = require("../controllers/razorpay_order_controller");

router.post("/create", razorpayOrderController.createOrder);

module.exports = router;
