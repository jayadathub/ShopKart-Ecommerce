import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

// Product catalog card rendering details, pricing, wishlist toggle, and cart action button
function ProductCard({ product, onDelete, onToggleWishlist, isWishlisted }) {
  const imageUrl = product.image || "https://placehold.co/600x400/black/white?text=No+Image";
  const { addToCart, actionLoading, isInCart } = useCart();

  const isAdding = actionLoading[product._id];
  const inCart = isInCart(product._id);

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;
    const res = await addToCart(product._id);
    if (!res.success) {
      alert(res.message);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-800 bg-black shadow-xl shadow-black/30 transition-all duration-300 hover:border-gray-700 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1">
      {/* Product Image and Wishlist action */}
      <div className="h-52 w-full overflow-hidden bg-black relative border-b border-gray-800">
        <img
          src={imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition duration-300 hover:scale-105"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://placehold.co/600x400/black/white?text=No+Image";
          }}
        />
        {onToggleWishlist && (
          <button
            onClick={() => onToggleWishlist(product)}
            className="absolute top-3 right-3 rounded-full bg-black/70 p-2 text-white border border-gray-700 backdrop-blur-md transition hover:scale-110 hover:bg-black"
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <span className="text-base leading-none">
              {isWishlisted ? "❤️" : "🤍"}
            </span>
          </button>
        )}
      </div>

      {/* Product Information and CTAs */}
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {product.category}
        </span>

        <h3 className="mb-2 text-lg font-bold text-white line-clamp-1">
          {product.name}
        </h3>

        <div className="mt-auto mb-4 flex items-center justify-between">
          <p className="text-2xl font-black text-white tracking-tight">
            ₹{product.price?.toLocaleString()}
          </p>
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
              product.stock > 0
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                : "border-rose-500/20 bg-rose-500/10 text-rose-400"
            }`}
          >
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Link
              to={`/products/${product._id}`}
              className="flex-1 rounded-xl border border-gray-700 bg-zinc-900 py-2.5 text-center text-sm font-bold text-white transition-all duration-200 hover:bg-zinc-800 active:scale-95"
            >
              View Details
            </Link>

            {onToggleWishlist && (
              <button
                onClick={() => onToggleWishlist(product)}
                className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                  isWishlisted
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    : "border-zinc-800 bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                {isWishlisted ? "❤️" : "🤍"}
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => onDelete(product._id)}
                className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2.5 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/20"
                title="Delete Product"
              >
                🗑️
              </button>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock <= 0}
            className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-md ${
              product.stock <= 0
                ? "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                : isAdding
                ? "bg-gray-400 text-black cursor-wait"
                : inCart
                ? "bg-emerald-500 text-black hover:bg-emerald-400"
                : "bg-white text-black hover:bg-gray-200"
            }`}
          >
            {isAdding ? (
              <span>Adding...</span>
            ) : product.stock <= 0 ? (
              <span>Out of Stock</span>
            ) : inCart ? (
              <span>🛒 Add Another</span>
            ) : (
              <span>🛒 Add to Cart</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
