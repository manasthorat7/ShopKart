# ShopKart 🛒

A full-stack e-commerce web application built with **React**, **Node.js**, **Express**, **MongoDB**, and **Razorpay** (Test Mode).

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Getting Started](#getting-started)
6. [Environment Variables](#environment-variables)
7. [Running the App](#running-the-app)
8. [API Reference](#api-reference)
9. [Frontend Routes](#frontend-routes)
10. [Data Models](#data-models)
11. [Troubleshooting](#troubleshooting)

---

## Project Overview

ShopKart is a student-level lab project built across six progressive labs:

| Lab | Topic |
|-----|-------|
| Lab 01 | Backend setup — Customer authentication (register / login / logout) |
| Lab 02 | Frontend — Login, Register, Home pages |
| Lab 03 | Product catalog — listing, search, category filter, detail view |
| Lab 04 | Wishlist — add, remove, per-customer persistence |
| Lab 05 | Shopping cart — add, update quantity, remove, global cart context |
| Lab 06 | Checkout & Orders — Razorpay payment, order management |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router v6, Context API, Vanilla CSS |
| **Backend** | Node.js (ES Modules), Express 5, Mongoose |
| **Database** | MongoDB |
| **Payments** | Razorpay (Test Mode) |
| **Auth** | JWT stored in `httpOnly` cookies |
| **HTTP Client** | Axios (`withCredentials: true`) |
| **Dev Server** | Nodemon |

---

## Features

- **Authentication** — Register, login, logout using JWT stored in `httpOnly` cookies. Password hashed with bcrypt.
- **Product Catalog** — Browse all products; filter by category; search by name; view product details with stock and description.
- **Wishlist** — Add or remove products; duplicate additions are rejected; per-customer persistence in MongoDB.
- **Shopping Cart** — Add products; increment/decrement quantity with stock-limit enforcement; remove items; real-time cart badge in Navbar via React Context API.
- **Checkout** — Shipping form with client-side and server-side validation (full name, phone, address, city, state, 6-digit pincode). Order total calculated entirely on the server.
- **Razorpay Payment** — Razorpay Checkout script loaded dynamically. HMAC SHA-256 signature verification on the server before marking payment PAID.
- **Order Management** — Orders store price/name/image snapshots at purchase time. View all past orders and full order details including shipping address.
- **Security** — `RAZORPAY_KEY_SECRET` never sent to the client. All order endpoints enforce ownership via `req.user._id`.

---

## Project Structure

```
ShopKart/
├── backend/
│   ├── config/
│   │   └── razorpay.js          # Razorpay SDK instance (loads dotenv first)
│   ├── controllers/
│   │   ├── customer.controller.js
│   │   ├── product.controller.js
│   │   ├── wishlist.controller.js
│   │   ├── cart.controller.js
│   │   └── order.controller.js
│   ├── middlewares/
│   │   └── auth.middleware.js   # isAuthenticated — verifies JWT cookie
│   ├── models/
│   │   ├── customer.model.js    # fullName, email, password, phone, wishlist[], cart[]
│   │   ├── product.model.js     # name, description, price, category, image, stock
│   │   └── order.model.js       # items snapshot, shippingAddress, paymentStatus, status
│   ├── routes/
│   │   ├── customer.routes.js
│   │   ├── product.routes.js
│   │   ├── wishlist.routes.js
│   │   ├── cart.routes.js
│   │   └── order.routes.js
│   ├── .env                     # NOT committed — contains secrets
│   ├── package.json
│   └── index.js                 # Express app entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx       # Logo, Cart badge, Wishlist, My Orders, Logout
│   │   ├── context/
│   │   │   └── CartContext.jsx  # Global cart state (cartItems, cartCount, CRUD methods)
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── ProductDetails.jsx
│   │   │   ├── Wishlist.jsx
│   │   │   ├── Cart.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrderSuccess.jsx
│   │   │   ├── Orders.jsx
│   │   │   └── OrderDetails.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios instance — baseURL: http://localhost:8080
│   │   ├── App.jsx              # All React Router routes
│   │   ├── main.jsx             # Root render — wraps app in CartProvider
│   │   └── index.css            # All styles (no CSS framework)
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm**
- **MongoDB** — local or [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Razorpay account** (free) — get Test Mode keys from [dashboard.razorpay.com](https://dashboard.razorpay.com) → Settings → API Keys

### 1. Clone

```bash
git clone https://github.com/manasthorat7/ShopKart.git
cd ShopKart
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Create `backend/.env`

```env
MONGO_URL=mongodb://localhost:27017/shopkart
JWT_SECRET=your_jwt_secret_here
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_here
PORT=8080
```

> Never commit `.env` — it is listed in `.gitignore`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWT tokens |
| `RAZORPAY_KEY_ID` | Yes | Public Razorpay Test key |
| `RAZORPAY_KEY_SECRET` | Yes | Private Razorpay secret (never sent to client) |
| `PORT` | No | Express port (defaults to `8080`) |

---

## Running the App

### Backend (Development)

```bash
cd backend
npm run dev      # nodemon index.js
```

Expected output:
```
DB Connected
Server Started at 8080
```

### Frontend (Development)

```bash
cd frontend
npm run dev      # Vite dev server at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## API Reference

### Customer — `/customers`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/customers/register` | No | Register a new customer (`fullName`, `email`, `password`, `phone`) |
| `POST` | `/customers/login` | No | Login — sets `httpOnly` JWT cookie |
| `GET` | `/customers/me` | Yes | Get logged-in customer profile |
| `POST` | `/customers/logout` | Yes | Clear JWT cookie |

### Products — `/products`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/products` | No | Create a product (`name`, `description`, `price`, `category`, `image`, `stock`) |
| `GET` | `/products` | No | List all products (supports `?search=` and `?category=` query params) |
| `GET` | `/products/:id` | No | Get product by ID |

### Wishlist — `/wishlist`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/wishlist/:productId` | Yes | Add product to wishlist (duplicate-safe) |
| `GET` | `/wishlist` | Yes | Get current customer's wishlist |
| `DELETE` | `/wishlist/:productId` | Yes | Remove product from wishlist |

### Cart — `/cart`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/cart/:productId` | Yes | Add product to cart (default qty 1) |
| `GET` | `/cart` | Yes | Get current customer's cart (populated with product data) |
| `PATCH` | `/cart/:productId` | Yes | Update quantity `{ quantity: number }` |
| `DELETE` | `/cart/:productId` | Yes | Remove product from cart |

### Orders — `/orders`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/orders/create-payment-order` | Yes | Validate cart + stock, create pending Order in DB, create Razorpay order. Body: `{ shippingAddress }` |
| `POST` | `/orders/verify-payment` | Yes | Verify Razorpay HMAC signature, mark order PAID + PLACED, clear cart. Body: `{ orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature }` |
| `GET` | `/orders` | Yes | List all orders for the logged-in customer (newest first) |
| `GET` | `/orders/:id` | Yes | Get a single order (ownership enforced) |

---

## Frontend Routes

| Path | Page | Description |
|------|------|-------------|
| `/register` | `Register.jsx` | New customer sign-up |
| `/login` | `Login.jsx` | Customer login |
| `/home` | `Home.jsx` | Post-login landing page |
| `/products` | `Products.jsx` | Product listing with search and filter |
| `/products/:id` | `ProductDetails.jsx` | Single product detail view |
| `/wishlist` | `Wishlist.jsx` | Customer's saved wishlist |
| `/cart` | `Cart.jsx` | Cart with quantity controls and subtotal |
| `/checkout` | `Checkout.jsx` | Shipping form + Razorpay payment |
| `/order-success/:id` | `OrderSuccess.jsx` | Confirmation screen after successful payment |
| `/orders` | `Orders.jsx` | List of all past orders |
| `/orders/:id` | `OrderDetails.jsx` | Full order detail with item snapshots and address |
| `*` | Redirect to `/login` | Fallback for unknown routes |

---

## Data Models

### Customer

```js
{
  fullName: String,
  email: String (unique),
  password: String (bcrypt hashed),
  phone: String,
  wishlist: [ObjectId -> Product],
  cart: [{ product: ObjectId -> Product, quantity: Number }],
  createdAt: Date
}
```

### Product

```js
{
  name: String,
  description: String,
  price: Number (min: 0.01),
  category: String,
  image: String,
  stock: Number (min: 0),
  createdAt: Date
}
```

### Order

```js
{
  user: ObjectId -> Customer,
  items: [{
    product: ObjectId -> Product,
    name: String,      // snapshot at purchase time
    price: Number,     // snapshot at purchase time
    quantity: Number,
    image: String
  }],
  shippingAddress: {
    fullName, phone, addressLine1, city, state, pincode
  },
  totalAmount: Number,
  paymentStatus: "PENDING" | "PAID" | "FAILED",
  status: "PENDING_PAYMENT" | "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED",
  razorpayOrderId: String,
  razorpayPaymentId: String,
  createdAt, updatedAt
}
```

---

## Troubleshooting

### Backend crashes: `key_id or oauthToken is mandatory`

**Cause:** In ES Modules, all `import` statements are evaluated before top-level code runs. So `dotenv.config()` in `index.js` runs *after* `razorpay.js` has already been evaluated, leaving `RAZORPAY_KEY_ID` undefined.

**Fix (already applied):** `backend/config/razorpay.js` loads dotenv itself:

```js
import dotenv from "dotenv";
dotenv.config();
import Razorpay from "razorpay";
```

### CORS errors in the browser

**Cause:** Frontend origin not matching the allowed origin.

**Fix:** Access the frontend at exactly `http://localhost:5173`. The backend dynamically sets `Access-Control-Allow-Origin` from the incoming `Origin` header.

### Cart not cleared after payment

**Cause:** `verify-payment` did not return `success: true` — usually a signature mismatch.

**Fix:** Ensure `RAZORPAY_KEY_SECRET` in `.env` exactly matches the secret in your Razorpay Test Mode dashboard.

### 401 Unauthorized on every request after login

**Cause:** Cookie not being sent, or CORS blocking credentials.

**Fix:** Confirm `api.js` uses `withCredentials: true` and the backend includes `Access-Control-Allow-Credentials: true`.
