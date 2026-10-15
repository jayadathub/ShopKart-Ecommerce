import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProductById } from "../services/api";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

// Product details view displaying full specifications, pricing, stock, and add-to-cart controls
function ProductDetails() {
  const { id } = useParams();
  const { addToCart, actionLoading, isInCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await getProductById(id);
        setProduct(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Something went wrong while loading product details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  return (
    <div className="min-h-screen text-black" style={{ backgroundColor: "lightgrey" }}>
      <Navbar />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link
          to="/products"
          className="inline-flex items-center text-sm font-bold text-black hover:text-gray-700 mb-6 transition"
        >
          ← Back to Products
        </Link>

        {loading && (
          <div className="py-20 text-center text-lg font-medium text-black">
            Loading product details...
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/20 p-6 text-center text-rose-800">
            <p className="font-semibold text-lg">{error}</p>
            <Link
              to="/products"
              className="mt-4 inline-block rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-500"
            >
              Return to Catalog
            </Link>
          </div>
        )}

        {product && !loading && !error && (
          <div className="overflow-hidden rounded-2xl border border-gray-800 bg-black p-6 shadow-2xl md:p-8 text-white">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="flex items-center justify-center overflow-hidden rounded-xl bg-black border border-gray-800 p-4">
                <img
                  src={product.image || "https://placehold.co/600x400/black/white?text=Product+Image"}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="max-h-96 w-full rounded-lg object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src =
                      "https://placehold.co/600x400/black/white?text=Product+Image";
                  }}
                />
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <span className="inline-block rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gray-300 border border-gray-700 mb-3">
                    {product.category}
                  </span>

                  <h1 className="text-3xl font-extrabold text-white mb-3 tracking-tight">
                    {product.name}
                  </h1>

                  <div className="mb-4">
                    <span className="text-3xl font-black text-white">
                      ₹{product.price?.toLocaleString()}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      (Inclusive of all taxes)
                    </span>
                  </div>

                  <div className="mb-6">
                    <span
                      className={`inline-block rounded-md px-3 py-1 text-xs font-semibold border ${
                        product.stock > 0
                          ? "border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
                          : "border-rose-500/30 bg-rose-500/20 text-rose-400"
                      }`}
                    >
                      {product.stock > 0
                        ? `${product.stock} units available in stock`
                        : "Currently Out of Stock"}
                    </span>
                  </div>

                  <div className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Description
                    </h2>
                    <p className="leading-relaxed text-gray-300 text-sm">
                      {product.description}
                    </p>
                  </div>

                  <button
                    onClick={async () => {
                      const res = await addToCart(product._id);
                      if (!res.success) alert(res.message);
                    }}
                    disabled={actionLoading[product._id] || product.stock <= 0}
                    className={`w-full rounded-xl py-3 text-sm font-bold transition duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                      product.stock <= 0
                        ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                        : actionLoading[product._id]
                        ? "bg-gray-400 text-black cursor-wait"
                        : isInCart(product._id)
                        ? "bg-emerald-500 text-black hover:bg-emerald-400"
                        : "bg-white text-black hover:bg-gray-200"
                    }`}
                  >
                    {actionLoading[product._id] ? (
                      <span>Adding to Cart...</span>
                    ) : product.stock <= 0 ? (
                      <span>Out of Stock</span>
                    ) : isInCart(product._id) ? (
                      <span>🛒 Add Another to Cart</span>
                    ) : (
                      <span>🛒 Add to Cart</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetails;
