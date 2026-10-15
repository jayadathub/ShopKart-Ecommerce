import 'dotenv/config';
import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import cookieParser from "cookie-parser";
import cors from 'cors';

import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import razorpayRoutes from "./routes/razorpay.routes.js";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), '.env') });

const app = express();
const port = 8082;

// Configure global middlewares for CORS, JSON and URL-encoded bodies, and cookies
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Mount API route groups
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);
app.use('/api', razorpayRoutes);

// Connect to MongoDB and start the Express HTTP server
const startServer = async () => {
    try {
        await mongoose.connect(process.env.dbURL);
        console.log('DB Connected');

        app.listen(port, () => {
            console.log(`Server Started at ${port}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error.message);
        process.exit(1);
    }
};

startServer();