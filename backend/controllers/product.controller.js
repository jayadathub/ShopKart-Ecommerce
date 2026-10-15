import Product from "../models/product.model.js";
import mongoose from "mongoose";

// Create a new product in the catalog with validated fields
export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || price === undefined || !category || !image || stock === undefined) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (Number(price) <= 0 || isNaN(Number(price))) {
            return res.status(400).json({ message: "Price must be greater than 0" });
        }
        if (Number(stock) < 0 || isNaN(Number(stock))) {
            return res.status(400).json({ message: "Stock cannot be negative" });
        }

        const product = await Product.create({
            name,
            description,
            price: Number(price),
            category,
            image,
            stock: Number(stock)
        });

        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Fetch products from catalog with optional ID lookup, search, category filtering, and sorting
export const getProducts = async (req, res) => {
    try {
        const { id } = req.params;

        if (id) {
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({ message: "Invalid product ID" });
            }
            const product = await Product.findById(id);
            if (!product) {
                return res.status(404).json({ message: "Product not found" });
            }
            return res.status(200).json(product);
        }

        const { search, category, sort } = req.query;
        let filter = {};

        if (search) {
            filter.name = { $regex: search, $options: "i" };
        }
        if (category && category !== "All Categories") {
            filter.category = category;
        }

        let sortOption = {};
        if (sort === "price_asc") sortOption.price = 1;
        if (sort === "price_desc") sortOption.price = -1;

        const products = await Product.find(filter).sort(sortOption);

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a product from the database by its ID
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};