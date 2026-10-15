import axiosInstance from "../axiosCalls/axios";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

// Navigation header providing site links, dynamic cart badge, and user logout
function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalCount } = useCart();

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/users/logout");
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-800 bg-black/95 px-6 py-4 text-white shadow-md backdrop-blur-md">
      <div className="flex items-center gap-8">
        <Link to="/home" className="flex items-center gap-2 text-2xl font-black tracking-tight text-white transition hover:opacity-90">
          <span>ShopKart</span>
          <span className="text-xl">🛒</span>
        </Link>

        <div className="flex items-center gap-2 text-sm font-medium">
          <Link
            to="/home"
            className={`rounded-lg px-3.5 py-1.5 transition ${
              isActive("/home")
                ? "bg-gray-800 text-white font-semibold"
                : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
            }`}
          >
            Home
          </Link>
          <Link
            to="/products"
            className={`rounded-lg px-3.5 py-1.5 transition ${
              isActive("/products")
                ? "bg-gray-800 text-white font-semibold"
                : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
            }`}
          >
            Products
          </Link>
          <Link
            to="/cart"
            className={`rounded-lg px-3.5 py-1.5 transition flex items-center gap-1.5 ${
              isActive("/cart")
                ? "bg-gray-800 text-white font-semibold"
                : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
            }`}
          >
            <span>Cart</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-black">
              {totalCount}
            </span>
          </Link>
          <Link
            to="/orders"
            className={`rounded-lg px-3.5 py-1.5 transition ${
              isActive("/orders")
                ? "bg-gray-800 text-white font-semibold"
                : "text-gray-400 hover:bg-gray-800/60 hover:text-white"
            }`}
          >
            My Orders
          </Link>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-lg border border-gray-700 bg-black px-4 py-2 text-sm font-semibold text-white transition hover:border-gray-500 hover:bg-gray-900 cursor-pointer"
      >
        Logout
      </button>
    </nav>
  );
}

export default Navbar;