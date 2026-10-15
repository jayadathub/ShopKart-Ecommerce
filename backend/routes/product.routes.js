import express from "express";
import {
    createProduct,
    getProducts,
    deleteProduct
} from "../controllers/product.controller.js";

// Product catalog routes for creating, listing, viewing, and deleting products
const productRoutes = express.Router();

productRoutes.post("/", createProduct);
productRoutes.get("/", getProducts);
productRoutes.get("/:id", getProducts);
productRoutes.delete("/:id", deleteProduct);

export default productRoutes;