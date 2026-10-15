import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

// Shopping cart screen displaying added items, quantity adjustments, and checkout navigation
function Cart() {
  const {
    cart,
    loading,
    error,
    actionLoading,
    fetchCart,
    updateQuantity,
    removeFromCart,
    totalCount,
    subtotal
  } = useCart();

  const handleIncrease = async (item) => {
    const pId = item.product?._id || item.product;
    const currentQty = item.quantity;
    const stock = item.product?.stock || 0;

    if (currentQty >= stock) {
      alert(`Cannot exceed available stock of ${stock}`);
      return;
    }

    const res = await updateQuantity(pId, currentQty + 1);
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleDecrease = async (item) => {
    const pId = item.product?._id || item.product;
    const currentQty = item.quantity;

    if (currentQty <= 1) {
      return;
    }

    const res = await updateQuantity(pId, currentQty - 1);
    if (!res.success) {
      alert(res.message);
    }
  };

  const handleRemove = async (productId) => {
    const res = await removeFromCart(productId);
    if (!res.success) {
      alert(res.message);
    }
  };

  return (
    <div className="min-h-screen text-black" style={{ backgroundColor: "lightgrey" }}>
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-black tracking-tight mb-8">
          My Cart 🛒
        </h1>

        {loading && (
          <div className="py-24 text-center rounded-2xl border border-gray-800 bg-black text-white shadow-xl">
            <p className="text-lg font-medium">Loading your cart...</p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/20 p-8 text-center text-rose-800 shadow-lg">
            <p className="font-semibold text-lg mb-4">{error}</p>
            <button
              onClick={fetchCart}
              className="rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white hover:bg-rose-500 cursor-pointer shadow-md"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cart.length === 0 && (
          <div className="rounded-2xl border border-gray-800 bg-black py-20 px-6 text-center shadow-xl text-white">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/products"
              className="inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-black hover:bg-gray-200 transition shadow-md"
            >
              Browse Products →
            </Link>
          </div>
        )}

        {!loading && !error && cart.length > 0 && (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8 flex flex-col gap-4">
              {cart.map((item) => {
                const product = item.product || {};
                const pId = product._id;
                const isItemUpdating = actionLoading[pId];
                const itemTotal = (product.price || 0) * item.quantity;
                const imageUrl =
                  product.image ||
                  "https://placehold.co/600x400/black/white?text=No+Image";

                return (
                  <div
                    key={pId || Math.random()}
                    className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-black p-5 shadow-xl text-white"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="h-20 w-20 rounded-xl object-cover border border-gray-800 bg-black flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://placehold.co/600x400/black/white?text=No+Image";
                        }}
                      />
                      <div>
                        <span className="text-xs uppercase font-semibold text-gray-400 tracking-wider">
                          {product.category}
                        </span>
                        <h3 className="text-base font-bold text-white line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-sm font-bold text-gray-300">
                          ₹{product.price?.toLocaleString()} each
                        </p>
                        {product.stock <= 5 && (
                          <span className="text-xs font-semibold text-amber-400">
                            Only {product.stock} left in stock
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t border-gray-800 pt-3 sm:border-t-0 sm:pt-0">
                      <div className="flex items-center rounded-xl border border-gray-700 bg-zinc-900 p-1">
                        <button
                          onClick={() => handleDecrease(item)}
                          disabled={item.quantity <= 1 || isItemUpdating}
                          className="h-8 w-8 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed font-extrabold cursor-pointer transition flex items-center justify-center"
                          title="Decrease Quantity"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-extrabold text-sm text-white">
                          {isItemUpdating ? "..." : item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrease(item)}
                          disabled={item.quantity >= product.stock || isItemUpdating}
                          className="h-8 w-8 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed font-extrabold cursor-pointer transition flex items-center justify-center"
                          title="Increase Quantity"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-black text-white">
                          ₹{itemTotal.toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleRemove(pId)}
                          disabled={isItemUpdating}
                          className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition cursor-pointer mt-1"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-24 rounded-2xl border border-gray-800 bg-black p-6 shadow-xl text-white">
                <h2 className="text-xl font-extrabold text-white mb-4 pb-3 border-b border-gray-800">
                  Order Summary
                </h2>

                <div className="flex justify-between items-center text-sm font-medium mb-3 text-gray-300">
                  <span>Total Items</span>
                  <span className="font-bold text-white">{totalCount}</span>
                </div>

                <div className="flex justify-between items-center text-lg font-extrabold mb-6 pt-3 border-t border-gray-800 text-white">
                  <span>Subtotal</span>
                  <span className="text-2xl font-black">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full rounded-xl bg-white py-3.5 text-center text-sm font-extrabold text-black transition hover:bg-gray-200 active:scale-95 shadow-lg cursor-pointer"
                >
                  Proceed to Checkout →
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Cart;
