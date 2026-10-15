import User from "../models/user.model.js";
import Product from "../models/product.model.js";

// Add a product or increase its quantity in the authenticated user's cart
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const cartItemIndex = req.user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    let targetQuantity = 1;
    if (cartItemIndex > -1) {
      targetQuantity = req.user.cart[cartItemIndex].quantity + 1;
    }

    if (targetQuantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Cannot add more units. Requested quantity (${targetQuantity}) exceeds available stock (${product.stock}).`
      });
    }

    if (cartItemIndex > -1) {
      req.user.cart[cartItemIndex].quantity = targetQuantity;
    } else {
      req.user.cart.push({ product: productId, quantity: 1 });
    }

    await req.user.save();
    await req.user.populate("cart.product");

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: req.user.cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to add product to cart"
    });
  }
};

// Retrieve the authenticated user's cart with populated product details
export const getCart = async (req, res) => {
  try {
    await req.user.populate("cart.product");

    return res.status(200).json({
      success: true,
      cart: req.user.cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch cart"
    });
  }
};

// Update the quantity of a specific product in the user's cart
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== "number" || isNaN(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid number of at least 1"
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const cartItem = req.user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart"
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Quantity requested (${quantity}) exceeds available stock (${product.stock})`
      });
    }

    cartItem.quantity = quantity;

    await req.user.save();
    await req.user.populate("cart.product");

    return res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart: req.user.cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update quantity"
    });
  }
};

// Remove a specific product from the user's cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    req.user.cart = req.user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await req.user.save();
    await req.user.populate("cart.product");

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart: req.user.cart
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to remove product from cart"
    });
  }
};
