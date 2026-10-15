import axiosInstance from "../axiosCalls/axios";

// Product catalog and user account API helper methods
export const createProduct = (data) => axiosInstance.post("/products", data);
export const getProducts = (params = {}) => axiosInstance.get("/products", { params });
export const getProductById = (id) => axiosInstance.get(`/products/${id}`);
export const deleteProduct = (id) => axiosInstance.delete(`/products/${id}`);
export const changePassword = (data) => axiosInstance.patch("/users/change-password", data);

// Shopping cart API helper methods
export const getCart = () => axiosInstance.get("/cart");
export const addToCartApi = (productId) => axiosInstance.post(`/cart/${productId}`);
export const updateCartQuantityApi = (productId, quantity) =>
  axiosInstance.patch(`/cart/${productId}`, { quantity });
export const removeFromCartApi = (productId) =>
  axiosInstance.delete(`/cart/${productId}`);

// Order creation, Razorpay payment verification, and order tracking API helper methods
export const createPaymentOrderApi = (data) =>
  axiosInstance.post("/orders/create-payment-order", data);
export const verifyPaymentApi = (data) =>
  axiosInstance.post("/orders/verify-payment", data);
export const getOrdersApi = () => axiosInstance.get("/orders");
export const getOrderByIdApi = (id) => axiosInstance.get(`/orders/${id}`);
export const updateOrderStatusApi = (id, status) =>
  axiosInstance.patch(`/orders/${id}/status`, { status });