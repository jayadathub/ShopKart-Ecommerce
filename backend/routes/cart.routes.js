import express from "express";
import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart
} from "../controllers/cart.controller.js";
import isAuthenticated from "../middlewares/authMiddleware.js";

// Shopping cart API routes for retrieving, adding, modifying, and removing items
const cartRoutes = express.Router();

cartRoutes.post("/:productId", isAuthenticated, addToCart);
cartRoutes.get("/", isAuthenticated, getCart);
cartRoutes.patch("/:productId", isAuthenticated, updateCartQuantity);
cartRoutes.delete("/:productId", isAuthenticated, removeFromCart);

export default cartRoutes;
