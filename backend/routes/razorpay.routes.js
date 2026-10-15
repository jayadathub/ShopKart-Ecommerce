import express from "express";
import crypto from "crypto";
import razorpay from "../config/razorpay.js";

const razorpayRoutes = express.Router();

// Create Razorpay order with minimum amount validation
razorpayRoutes.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;

    if (!amount || Number(amount) < 100) {
      return res.status(400).json({
        success: false,
        message: "Order amount must be at least 100 paise (₹1)"
      });
    }

    const options = {
      amount: Math.round(Number(amount)),
      currency: currency || "INR",
      receipt: receipt || `receipt_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID?.trim()
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create Razorpay order"
    });
  }
});

// Verify Razorpay payment signature using SHA256 HMAC
razorpayRoutes.post("/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment parameters (razorpay_order_id, razorpay_payment_id, razorpay_signature)"
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET?.trim())
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully"
    });
  } catch (error) {
    console.error("Razorpay payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed"
    });
  }
});

export default razorpayRoutes;
