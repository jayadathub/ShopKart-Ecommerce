import Razorpay from "razorpay";
import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });

// Initialize Razorpay client with API key credentials
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID?.trim() || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET?.trim() || "test_secret_placeholder"
});

export default razorpay;
