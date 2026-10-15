import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/api";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";

const CATEGORIES = [
  "All Categories",
  "Electronics",
  "Fashion",
  "Books",
  "Home"
];

// Product catalog interface with keyword search, category filtering, price sorting, and wishlist persistence
function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("");

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("shopkart_wishlist")) || [];
    } catch {
      return [];
    }
  });
  const [showWishlist, setShowWishlist] = useState(false);

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item._id === product._id);
      const updated = exists
        ? prev.filter((item) => item._id !== product._id)
        : [...prev, product];
      
      try {
        localStorage.setItem("shopkart_wishlist", JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save wishlist:", err);
      }
      return updated;
    });
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    try {
      const params = {};
      if (search.trim()) {
        params.search = search.trim();
      }
      if (category && category !== "All Categories") {
        params.category = category;
      }
      if (sort) {
        params.sort = sort;
      }

      const res = await getProducts(params);
      setProducts(res.data.products || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong while loading products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, sort]);

  return (
    <div className="min-h-screen text-black" style={{ backgroundColor: "lightgrey" }}>
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-black tracking-tight">
              Product Catalog
            </h1>
            <p className="mt-1 text-sm text-gray-700 font-medium">
              Browse, search, and discover products in ShopKart
            </p>
          </div>

          <button
            onClick={() => setShowWishlist(!showWishlist)}
            className="self-start rounded-xl border border-gray-800 bg-black px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-gray-900 flex items-center gap-2.5 cursor-pointer"
          >
            <span>❤️ Wishlist</span>
            <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs font-bold text-white border border-gray-700">
              {wishlist.length}
            </span>
          </button>
        </div>

        {showWishlist && (
          <div className="mb-8 rounded-2xl border border-gray-800 bg-black p-6 shadow-xl text-white">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <span>❤️ My Wishlist</span>
                <span className="text-sm font-normal text-gray-400">
                  ({wishlist.length} {wishlist.length === 1 ? "item" : "items"})
                </span>
              </h2>
              {wishlist.length > 0 && (
                <button
                  onClick={() => {
                    setWishlist([]);
                    localStorage.removeItem("shopkart_wishlist");
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
                >
                  Clear Wishlist
                </button>
              )}
            </div>

            {wishlist.length === 0 ? (
              <p className="text-sm text-gray-400">
                Your wishlist is currently empty. Click the ❤️ icon on any product to add it here!
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {wishlist.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 rounded-xl border border-gray-800 bg-black p-3 shadow-md"
                  >
                    <img
                      src={item.image || "https://placehold.co/600x400/black/white?text=No+Image"}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="h-16 w-16 rounded-lg object-cover border border-gray-800 bg-black"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://placehold.co/600x400/black/white?text=No+Image";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs font-black text-gray-200">
                        ₹{item.price?.toLocaleString()}
                      </p>
                      <Link
                        to={`/products/${item._id}`}
                        className="text-xs font-semibold text-gray-300 hover:text-white hover:underline"
                      >
                        View Details →
                      </Link>
                    </div>
                    <button
                      onClick={() => toggleWishlist(item)}
                      className="rounded p-1 text-gray-400 hover:text-rose-400 text-sm cursor-pointer"
                      title="Remove from wishlist"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 rounded-2xl border border-gray-800 bg-black p-4 shadow-xl md:grid-cols-12 text-white">
          <div className="md:col-span-6">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-300">
              Search
            </label>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-black p-2.5 text-sm text-white placeholder-gray-400 focus:border-white focus:outline-none transition"
            />
          </div>

          <div className="md:col-span-3">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-300">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-black p-2.5 text-sm text-white focus:border-white focus:outline-none transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className="bg-black text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-300">
              Sort By
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-black p-2.5 text-sm text-white focus:border-white focus:outline-none transition"
            >
              <option value="" className="bg-black text-white">Featured</option>
              <option value="price_asc" className="bg-black text-white">Price: Low to High</option>
              <option value="price_desc" className="bg-black text-white">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading && (
          <div className="py-24 text-center">
            <p className="text-lg font-medium text-black">
              Loading products...
            </p>
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/20 p-6 text-center text-rose-800">
            <p className="font-semibold text-lg">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-3 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-gray-800 bg-black py-24 text-center shadow-xl text-white">
            <div className="text-4xl mb-2">🔍</div>
            <h3 className="text-lg font-bold text-white">
              No products found.
            </h3>
            <p className="mt-1 text-sm text-gray-400">
              Try adjusting your search terms or category filter.
            </p>
            {(search || category !== "All Categories") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All Categories");
                  setSort("");
                }}
                className="mt-4 rounded-xl bg-white px-5 py-2 text-xs font-bold text-black hover:bg-gray-200 cursor-pointer shadow-md"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onToggleWishlist={toggleWishlist}
                isWishlisted={wishlist.some((item) => item._id === product._id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Products;