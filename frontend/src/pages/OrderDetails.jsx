import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrderByIdApi } from "../services/api";
import axiosInstance from "../axiosCalls/axios";

// Detailed order receipt showing delivery address, payment metadata, and purchased items breakdown
function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");
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
        setError(
          err.response?.data?.message || "Failed to load order details."
        );
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
          <p className="text-gray-600 font-medium">Loading order details...</p>
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
            className="rounded-xl bg-black px-6 py-2.5 text-xs font-bold text-white inline-block hover:bg-gray-800"
          >
            ← Back to My Orders
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              to="/orders"
              className="text-xs font-bold text-gray-500 hover:text-black mb-1 inline-block"
            >
              ← Back to My Orders
            </Link>
            <h1 className="text-2xl font-black tracking-tight">
              Order #{order._id}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Placed on {formattedDate}</p>
          </div>

          <span className="rounded-full bg-green-100 px-3.5 py-1 text-xs font-black text-green-800 border border-green-200">
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Shipping Address
            </h3>
            {order.shippingAddress ? (
              <div className="text-sm text-gray-800 space-y-1">
                <p className="font-bold">{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.phone}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.pincode}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Not available</p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Payment Details
            </h3>
            <div className="text-sm text-gray-800 space-y-1">
              <p>
                <span className="text-gray-500">Status: </span>
                <span className="font-bold text-blue-600">
                  {order.paymentStatus || "PENDING"}
                </span>
              </p>
              {order.razorpayPaymentId && (
                <p className="font-mono text-xs text-gray-600 break-all">
                  <span className="text-gray-500">Payment ID: </span>
                  {order.razorpayPaymentId}
                </p>
              )}
              {order.razorpayOrderId && (
                <p className="font-mono text-xs text-gray-600 break-all">
                  <span className="text-gray-500">Razorpay Order: </span>
                  {order.razorpayOrderId}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Order Total
            </h3>
            <p className="text-2xl font-black text-gray-900 mt-2">
              ₹{order.totalAmount?.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 font-semibold mt-1">
              ✓ Paid via Razorpay Test Mode
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
            Items in this Order ({order.items?.length || 0})
          </h2>

          <div className="divide-y divide-gray-100">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="py-3 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                    />
                  )}
                  <div>
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      ₹{item.price?.toLocaleString()} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-gray-900">
                  ₹{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default OrderDetails;
