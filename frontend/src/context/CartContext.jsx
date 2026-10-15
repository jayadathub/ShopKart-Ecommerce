import { createContext, useContext, useState, useEffect } from "react";
import {
  getCart,
  addToCartApi,
  updateCartQuantityApi,
  removeFromCartApi
} from "../services/api";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Context provider managing shopping cart state, total counts, monetary subtotals, and backend sync operations
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  const fetchCart = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getCart();
      if (res.data && res.data.cart) {
        setCart(res.data.cart);
      }
    } catch (err) {
      if (err.response?.status !== 401) {
        setError(
          err.response?.data?.message || "Unable to load your cart."
        );
      } else {
        setCart([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const addToCart = async (productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await addToCartApi(productId);
      if (res.data && res.data.cart) {
        setCart(res.data.cart);
      }
      return { success: true, message: res.data?.message || "Added to cart" };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add item to cart.";
      return { success: false, message: msg };
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    setActionLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await updateCartQuantityApi(productId, newQuantity);
      if (res.data && res.data.cart) {
        setCart(res.data.cart);
      }
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update quantity.";
      return { success: false, message: msg };
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const removeFromCart = async (productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: true }));
    try {
      const res = await removeFromCartApi(productId);
      if (res.data && res.data.cart) {
        setCart(res.data.cart);
      }
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to remove item.";
      return { success: false, message: msg };
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const totalCount = cart.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + ((item.product?.price || 0) * (item.quantity || 0)),
    0
  );

  const isInCart = (productId) => {
    return cart.some(
      (item) => item.product?._id === productId || item.product === productId
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        actionLoading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        subtotal,
        isInCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
