import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";
import { createPaymentOrderApi, verifyPaymentApi } from "../services/api";
import axiosInstance from "../axiosCalls/axios";

// Dynamically load the external Razorpay Checkout SDK script if not already present
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Checkout screen capturing shipping information and handling Razorpay payment processing
function Checkout() {
  const navigate = useNavigate();
  const { cart, subtotal, totalCount, clearCart } = useCart();

  const [authChecking, setAuthChecking] = useState(true);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingCheckoutData, setPendingCheckoutData] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await axiosInstance.get("/users/me");
      } catch (err) {
        navigate("/login");
        return;
      } finally {
        setAuthChecking(false);
      }
    };
    verifyAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setServerError("");
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required.";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^[0-9]{10}$/.test(formData.phone.trim())) {
      errors.phone = "Phone number must be a valid 10-digit number.";
    }

    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = "Address is required.";
    }

    if (!formData.city.trim()) {
      errors.city = "City is required.";
    }

    if (!formData.state.trim()) {
      errors.state = "State is required.";
    }

    if (!formData.pincode.trim()) {
      errors.pincode = "Pincode is required.";
    } else if (!/^[0-9]{6}$/.test(formData.pincode.trim())) {
      errors.pincode = "Pincode must contain 6 digits.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSimulatedPayment = async () => {
    if (!pendingCheckoutData) return;
    setSubmitting(true);
    setServerError("");
    try {
      const verifyRes = await verifyPaymentApi({
        shopKartOrderId: pendingCheckoutData.shopKartOrderId,
        razorpay_order_id: pendingCheckoutData.razorpayOrderId,
        razorpay_payment_id: "pay_test_" + Date.now(),
        razorpay_signature: "mock_signature_test"
      });

      if (verifyRes.data?.success) {
        clearCart();
        navigate(`/order-success/${pendingCheckoutData.shopKartOrderId}`);
      }
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Payment verification failed."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!cart || cart.length === 0) {
      setServerError("Your cart is empty. Add items before checking out.");
      return;
    }

    setSubmitting(true);
    setServerError("");
    setPendingCheckoutData(null);

    try {
      const res = await createPaymentOrderApi({
        shippingAddress: formData
      });

      const data = res.data;
      const isPlaceholder = !data.key || data.key.includes("placeholder");
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || isPlaceholder) {
        setPendingCheckoutData(data);
        if (isPlaceholder) {
          setServerError(
            "Test Mode Note: Placeholder Razorpay keys detected in backend/.env. You can complete the test payment below, or replace RAZORPAY_KEY_ID in backend/.env with your real Razorpay test key."
          );
        } else {
          setServerError("Unable to load Razorpay Checkout script. Check your internet connection.");
        }
        setSubmitting(false);
        return;
      }

      const options = {
        key: data.key || import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "ShopKart",
        description: "Purchase Order",
        order_id: data.razorpayOrderId,
        handler: async function (response) {
          setSubmitting(true);
          try {
            const verifyRes = await verifyPaymentApi({
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data?.success) {
              clearCart();
              navigate(`/order-success/${data.shopKartOrderId}`);
            }
          } catch (verifyErr) {
            setServerError(
              verifyErr.response?.data?.message ||
                "Payment verification failed on server. Your cart has not been cleared."
            );
          } finally {
            setSubmitting(false);
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
          }
        },
        theme: {
          color: "#000000"
        }
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", function (response) {
        setServerError(
          `Payment failed: ${response.error?.description || "Transaction declined"}. Your cart has not been cleared.`
        );
        setSubmitting(false);
      });

      paymentObject.open();
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Failed to create order. Please try again."
      );
      setSubmitting(false);
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600 font-medium">Checking session...</p>
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-6">
              You must add products to your cart before proceeding to checkout.
            </p>
            <Link
              to="/products"
              className="inline-block rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Browse Products →
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete your shipping details and proceed to secure payment.
          </p>
        </div>

        {serverError && (
          <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center gap-2 font-semibold">
              <span>⚠️</span>
              <span>{serverError}</span>
            </div>
            {pendingCheckoutData && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleSimulatedPayment}
                  disabled={submitting}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 cursor-pointer"
                >
                  {submitting ? "Processing..." : "Complete Test Payment (Simulate Success) →"}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 pb-3 border-b border-gray-100">
                Shipping Details
              </h2>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Aarav Sharma"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none ${
                      formErrors.fullName
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-black"
                    }`}
                  />
                  {formErrors.fullName && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Phone Number (10 digits) *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 9876543210"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none ${
                      formErrors.phone
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-black"
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Address *
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    placeholder="e.g. 22 MG Road, Flat 4B"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none ${
                      formErrors.addressLine1
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-black"
                    }`}
                  />
                  {formErrors.addressLine1 && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.addressLine1}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="e.g. Bengaluru"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none ${
                        formErrors.city
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    {formErrors.city && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Karnataka"
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none ${
                        formErrors.state
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300 focus:border-black"
                      }`}
                    />
                    {formErrors.state && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.state}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Pincode (6 digits) *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 560001"
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm transition focus:outline-none ${
                      formErrors.pincode
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 focus:border-black"
                    }`}
                  />
                  {formErrors.pincode && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.pincode}</p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-xl bg-black py-3.5 text-center text-sm font-bold text-white transition hover:bg-gray-800 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {submitting ? "Processing Payment..." : "Place Order & Pay with Razorpay →"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4 pb-3 border-b border-gray-100">
                Order Summary
              </h2>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-gray-100">
                {cart.map((item) => {
                  const p = item.product || {};
                  const itemTotal = (p.price || 0) * (item.quantity || 1);
                  return (
                    <div key={p._id || Math.random()} className="pt-3 first:pt-0 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="h-10 w-10 rounded-lg object-cover border border-gray-200"
                          />
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1">
                            {p.name || "Product"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} × ₹{p.price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900">
                        ₹{itemTotal.toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Total Items</span>
                  <span className="font-semibold text-gray-900">{totalCount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-gray-200 text-gray-900">
                  <span>Total</span>
                  <span className="text-2xl font-black">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                🔒 Safe & Secure Checkout via Razorpay (Test Mode).
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Checkout;
