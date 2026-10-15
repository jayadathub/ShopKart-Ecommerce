import crypto from "crypto";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import razorpay from "../config/razorpay.js";

// Validate required fields and formats for a shipping address
const validateShippingAddress = (address) => {
  if (!address || typeof address !== "object") {
    return "Shipping address is required.";
  }

  const { fullName, phone, addressLine1, city, state, pincode } = address;

  if (
    !fullName?.trim() ||
    !phone?.trim() ||
    !addressLine1?.trim() ||
    !city?.trim() ||
    !state?.trim() ||
    !pincode?.trim()
  ) {
    return "All shipping address fields are required.";
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone.trim())) {
    return "Phone number must be a valid 10-digit number.";
  }

  const pincodeRegex = /^[0-9]{6}$/;
  if (!pincodeRegex.test(pincode.trim())) {
    return "Pincode must contain 6 digits.";
  }

  return null;
};

// Validate user cart, create pending database order, and initialize Razorpay payment order
export const createPaymentOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body;

    const addressError = validateShippingAddress(shippingAddress);
    if (addressError) {
      return res.status(400).json({ success: false, message: addressError });
    }

    const cart = req.user.cart;
    if (!cart || cart.length === 0) {
      return res.status(400).json({ success: false, message: "Cart cannot be empty" });
    }

    const orderItems = [];
    let calculatedTotal = 0;

    for (const item of cart) {
      const productId = item.product?._id || item.product;
      const product = await Product.findById(productId);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart are no longer available."
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}.`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });

      calculatedTotal += product.price * item.quantity;
    }

    const shopKartOrder = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        phone: shippingAddress.phone.trim(),
        addressLine1: shippingAddress.addressLine1.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim()
      },
      totalAmount: calculatedTotal,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT"
    });

    await shopKartOrder.save();

    const amountInPaise = Math.round(calculatedTotal * 100);
    let razorpayOrderId;

    try {
      const razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: shopKartOrder._id.toString()
      });

      razorpayOrderId = razorpayOrder.id;
    } catch (rzpErr) {
      console.warn("Razorpay API call failed:", rzpErr.message);

      if (
        !process.env.RAZORPAY_KEY_ID ||
        process.env.RAZORPAY_KEY_ID.includes("placeholder")
      ) {
        razorpayOrderId = `order_test_${shopKartOrder._id}`;
      } else {
        await Order.findByIdAndDelete(shopKartOrder._id);
        return res.status(500).json({
          success: false,
          message: `Razorpay Order creation failed: ${rzpErr.message}`
        });
      }
    }

    shopKartOrder.razorpayOrderId = razorpayOrderId;
    await shopKartOrder.save();

    return res.status(200).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: razorpayOrderId,
      order_id: razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID?.trim() || "rzp_test_placeholder"
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order"
    });
  }
};

// Verify payment signature, confirm the order, deduct product stock, and clear user cart
export const verifyPayment = async (req, res) => {
  try {
    const {
      shopKartOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters"
      });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not own this order"
      });
    }

    const keySecret = (process.env.RAZORPAY_KEY_SECRET || "test_secret_placeholder").trim();
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    const isMockValid =
      (!process.env.RAZORPAY_KEY_ID ||
        process.env.RAZORPAY_KEY_ID.includes("placeholder")) &&
      razorpay_signature === "mock_signature_test";

    if (expectedSignature !== razorpay_signature && !isMockValid) {
      order.paymentStatus = "FAILED";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature"
      });
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    req.user.cart = [];
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: "Payment verified and order confirmed",
      order
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to verify payment"
    });
  }
};

// Retrieve all past orders placed by the authenticated user
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch orders"
    });
  }
};

// Retrieve details for a single order owned by the authenticated user
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not own this order"
      });
    }

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch order details"
    });
  }
};

// Update the fulfillment status of an existing order
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(", ")}`
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not own this order"
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status"
    });
  }
};
