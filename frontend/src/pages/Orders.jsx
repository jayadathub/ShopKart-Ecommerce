import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getOrdersApi, updateOrderStatusApi } from "../services/api";
import axiosInstance from "../axiosCalls/axios";

// User orders dashboard displaying previous order history and fulfillment status tracking
function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      await axiosInstance.get("/users/me");

      const res = await getOrdersApi();
      if (res.data?.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/login");
        return;
      }
      setError(
        err.response?.data?.message || "Failed to load orders. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  const handleStatusProgression = async (orderId, currentStatus) => {
    const sequence = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
    const currentIndex = sequence.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === sequence.length - 1) return;

    const nextStatus = sequence[currentIndex + 1];
    setUpdatingId(orderId);
    try {
      const res = await updateOrderStatusApi(orderId, nextStatus);
      if (res.data?.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: nextStatus } : o))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to advance order status");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PLACED":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "PENDING_PAYMENT":
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight">My Orders</h1>
            <p className="text-sm text-gray-500 mt-1">
              View your past order history and delivery statuses.
            </p>
          </div>
          <Link
            to="/products"
            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>

        {loading && (
          <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-gray-500 font-medium">Loading your orders...</p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-white border border-red-200 p-8 text-center shadow-sm">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <button
              onClick={fetchOrders}
              className="rounded-xl bg-black px-6 py-2.5 text-xs font-bold text-white hover:bg-gray-800 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl bg-white border border-gray-200 p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">🛍️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              You have not placed any orders yet.
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              When you order products, they will appear here.
            </p>
            <Link
              to="/products"
              className="inline-block rounded-xl bg-black px-6 py-3 text-sm font-bold text-white hover:bg-gray-800"
            >
              Start Shopping →
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                }
              );

              return (
                <div
                  key={order._id}
                  className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-gray-100">
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                        Order #{order._id}
                      </span>
                      <span className="text-xs text-gray-500">{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full border px-3 py-0.5 text-xs font-black ${getStatusBadge(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="py-4 space-y-2.5">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-9 w-9 rounded-md object-cover border border-gray-200"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium text-gray-700">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-500 block">Total</span>
                      <span className="text-lg font-black text-gray-900">
                        ₹{order.totalAmount?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status !== "DELIVERED" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusProgression(order._id, order.status)
                          }
                          disabled={updatingId === order._id}
                          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 cursor-pointer"
                          title="Advance order status for testing (Bonus)"
                        >
                          {updatingId === order._id
                            ? "Updating..."
                            : "Advance Status →"}
                        </button>
                      )}

                      <Link
                        to={`/orders/${order._id}`}
                        className="rounded-xl bg-black px-4 py-2 text-xs font-bold text-white hover:bg-gray-800 transition"
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Orders;
