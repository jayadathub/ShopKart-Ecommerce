import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderByIdApi } from "../services/api";
import axiosInstance from "../axiosCalls/axios";

// Order confirmation page displaying successful payment verification and transaction summary
function OrderSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        await axiosInstance.get("/users/me");

        const res = await getOrderByIdApi(id);
        if (res.data?.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/login");
          return;
        }
        setError(err.response?.data?.message || "Failed to load order confirmation.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center py-24">
          <p className="text-gray-600 font-medium">Loading order confirmation...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-2xl border border-gray-200 text-center shadow-sm">
          <p className="text-red-500 font-bold mb-4">{error || "Order not found"}</p>
          <Link
            to="/orders"
            className="rounded-xl bg-black px-6 py-2.5 text-sm font-semibold text-white inline-block hover:bg-gray-800"
          >
            Go to My Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-600 mb-4">
            ✅
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-1">
            Order Placed Successfully
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Your payment has been verified and your order has been saved successfully.
          </p>

          <div className="rounded-2xl bg-gray-50 p-6 text-left border border-gray-200 mb-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase">Order ID</span>
              <span className="font-mono text-sm font-bold text-gray-800">{order._id}</span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase">Status</span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                {order.status || "PLACED"}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase">Payment Status</span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                {order.paymentStatus || "PAID"}
              </span>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-xs font-bold text-gray-500 uppercase">Total Amount</span>
              <span className="text-xl font-black text-gray-900">
                ₹{order.totalAmount?.toLocaleString()}
              </span>
            </div>

            {order.shippingAddress && (
              <div className="pt-2 text-xs text-gray-600">
                <p className="font-bold text-gray-800 mb-1">Delivering to:</p>
                <p>{order.shippingAddress.fullName} ({order.shippingAddress.phone})</p>
                <p>
                  {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/orders"
              className="w-full sm:w-auto rounded-xl bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-gray-800 text-center"
            >
              View My Orders →
            </Link>
            <Link
              to="/products"
              className="w-full sm:w-auto rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 text-center"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderSuccess;
