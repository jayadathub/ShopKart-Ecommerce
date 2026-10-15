# ShopKart - Full-Stack E-Commerce Application 🛒

A full-stack modern e-commerce web application with user authentication, catalog exploration, product filtering, shopping cart management, and Razorpay payment integration.

---

## 🚀 Features

- **User Authentication**: Secure signup, login, session cookies (`httpOnly`), password hashing with `bcrypt`, and JWT verification.
- **Product Catalog**: Explore products with dynamic category filters, search by name, and sort by price (Low to High / High to Low).
- **Product Details & Stock Tracking**: View full product descriptions, image views, and real-time stock availability.
- **Persistent Wishlist**: Wishlist items saved across user sessions via `localStorage`.
- **Shopping Cart**: Add products, dynamically increment/decrement quantities with inventory stock constraints, and real-time subtotal calculation.
- **Secure Checkout & Razorpay Integration**:
  - Shipping address collection and client/server validation.
  - Razorpay order generation with currency validation (paise).
  - Cryptographic HMAC-SHA256 signature verification upon payment completion.
  - Automatic product stock deduction and cart reset on payment verification.
- **Order Management**: View past orders, detailed order receipts with payment IDs, and order status progression (`PLACED` → `CONFIRMED` → `SHIPPED` → `DELIVERED`).

---

## 🛠️ Tech Stack

- **Frontend**: React (Vite), React Router, TailwindCSS / Vanilla CSS, Axios
- **Backend**: Node.js, Express.js, Mongoose (MongoDB ODM)
- **Database**: MongoDB Atlas
- **Authentication**: JWT (`jsonwebtoken`), `bcrypt`, `cookie-parser`
- **Payment Gateway**: Razorpay Node SDK & Razorpay Standard Checkout JS

---

## 📂 Project Structure

```
Social-Media/
├── backend/
│   ├── config/             # Razorpay configuration
│   ├── controllers/        # Request handlers (auth, product, cart, order)
│   ├── middlewares/        # JWT Authentication middleware
│   ├── models/             # Mongoose data schemas (User, Product, Order)
│   ├── routes/             # Express API endpoints
│   ├── utils/              # Token helpers
│   ├── .env.example        # Environment variable template
│   └── index.js            # Express server entry point
├── frontend/
│   ├── src/
│   │   ├── axiosCalls/     # Axios client instance
│   │   ├── components/     # Navbar, ProductCard, etc.
│   │   ├── context/        # CartContext global provider
│   │   ├── pages/          # Login, SignUp, Products, Cart, Checkout, Orders
│   │   ├── services/       # Frontend API methods
│   │   └── App.jsx         # App routing & component tree
│   ├── .env.example        # Frontend environment variable template
│   └── vite.config.js      # Vite build configuration
└── README.md
```

---

## ⚙️ Setup and Installation

### 1. Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster or local MongoDB instance

---

### 2. Backend Setup

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your actual credentials in `backend/.env`:
   ```env
   dbURL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?appName=Cluster0
   jwt_secret=your_strong_jwt_secret
   RAZORPAY_KEY_ID=rzp_test_your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

4. Start the backend server:
   ```bash
   npm run dev   # or: node index.js
   ```
   The backend runs on **`http://localhost:8082`**.

---

### 3. Frontend Setup

1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (optional for Razorpay):
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Provide your Razorpay public key ID:
   ```env
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at **`http://localhost:5173`**.

---

### 4. Running the Complete App

1. Ensure the **backend** is running at `http://localhost:8082`.
2. Ensure the **frontend** is running at `http://localhost:5173`.
3. Open your browser to `http://localhost:5173`.
4. Register a new account on `/signup` or log in on `/login` to start shopping.

---

## 🔒 Security Best Practices

- **Zero Secret Leaks**: `.env` and sensitive files are excluded from Git tracking via `.gitignore`.
- **Sample Templates**: `.env.example` files are provided for both client and server setups without exposing confidential secrets or API tokens.
