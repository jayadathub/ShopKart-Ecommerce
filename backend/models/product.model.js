import mongoose from "mongoose";

// Product schema defining catalog item attributes, price constraints, and stock tracking
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0.01
    },
    category: {
        type: String,
        required: [true, "Category is required"]
    },
    image: {
        type: String,
        required: [true, "Image URL is required"]
    },
    stock: {
        type: Number,
        required: [true, "Stock is required"],
        min: [0, "Stock cannot be negative"]
    }
}, {
    timestamps: true
});

const Product = mongoose.model("Product", productSchema);

export default Product;