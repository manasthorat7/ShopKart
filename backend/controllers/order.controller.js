import crypto from "crypto";
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import razorpayInstance from "../config/razorpay.js";

// ─────────────────────────────────────────────────────────────────────────────
// POST /orders/create-payment-order
// Creates a ShopKart order + a Razorpay order in TEST MODE.
// Protected by isAuthenticated.
// ─────────────────────────────────────────────────────────────────────────────
export const createPaymentOrder = async (req, res) => {
    try {
        // 1. Customer authenticated via isAuthenticated. req.user = authenticated customer.

        // 2. Load the authenticated Customer from DB.
        const customer = await Customer.findById(req.user._id);

        // 3. If Customer is missing, return 404.
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        // 4. Reject empty cart.
        if (!customer.cart || customer.cart.length === 0) {
            return res.status(400).json({ message: "Your cart is empty. Add items before placing an order." });
        }

        // 5. Validate shippingAddress from request body.
        const { shippingAddress } = req.body;

        if (!shippingAddress) {
            return res.status(400).json({ message: "Shipping address is required." });
        }

        const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

        // All fields must be present and non-whitespace.
        const requiredFields = { fullName, phone, addressLine1, city, state, pincode };
        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value || typeof value !== "string" || value.trim() === "") {
                return res.status(400).json({ message: `Shipping address field '${field}' is required.` });
            }
        }

        // Pincode: exactly 6 digits.
        if (!/^\d{6}$/.test(pincode.trim())) {
            return res.status(400).json({ message: "Pincode must be exactly 6 digits." });
        }

        // Phone: 7–15 digits, optional leading +.
        if (!/^\+?\d{7,15}$/.test(phone.trim())) {
            return res.status(400).json({ message: "Please provide a valid phone number." });
        }

        // 6, 7, 8. Load latest Product data, verify stock, build item snapshots.
        const orderItems = [];
        let totalAmount = 0;

        for (const cartItem of customer.cart) {
            const product = await Product.findById(cartItem.product);

            // 6. Product must still exist.
            if (!product) {
                return res.status(400).json({
                    message: "A product in your cart no longer exists. Please review your cart."
                });
            }

            // 7. Stock check against latest DB value.
            if (cartItem.quantity > product.stock) {
                return res.status(400).json({
                    message: `Insufficient stock for "${product.name}". Only ${product.stock} unit(s) available.`
                });
            }

            // 8. Build snapshot item (name, price, quantity, image from DB — NOT from frontend).
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: cartItem.quantity,
                image: product.image
            });

            // 9. Backend-only total.
            totalAmount += product.price * cartItem.quantity;
        }

        // 10. Create the ShopKart Order in MongoDB (status: PENDING_PAYMENT).
        const newOrder = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress: {
                fullName: fullName.trim(),
                phone: phone.trim(),
                addressLine1: addressLine1.trim(),
                city: city.trim(),
                state: state.trim(),
                pincode: pincode.trim()
            },
            totalAmount,
            paymentStatus: "PENDING",
            status: "PENDING_PAYMENT"
        });

        // 11. Create the Razorpay order (amount in paise, currency INR).
        const razorpayOrder = await razorpayInstance.orders.create({
            amount: Math.round(totalAmount * 100), // paise
            currency: "INR",
            receipt: `order_${newOrder._id}`
        });

        // 12. Save the Razorpay order ID into the ShopKart order.
        newOrder.razorpayOrderId = razorpayOrder.id;
        await newOrder.save();

        // NOTE: Cart is NOT cleared here.
        // Cart is cleared ONLY after successful Razorpay payment signature verification.

        // 13. Return checkout data required by the Razorpay frontend SDK.
        //     RAZORPAY_KEY_SECRET is never returned.
        return res.status(201).json({
            success: true,
            orderId: newOrder._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,   // in paise
            currency: "INR",
            key: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /orders/verify-payment
// Verifies Razorpay signature server-side.
// Protected by isAuthenticated.
// ─────────────────────────────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
    try {
        const {
            orderId,             // ShopKart Order ID
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature
        } = req.body;

        // Basic presence check.
        if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing payment verification fields." });
        }

        // 1. Load the ShopKart order using the authenticated user's ID.
        //    Never trust the customer ID from the body.
        const order = await Order.findOne({
            _id: orderId,
            user: req.user._id   // ownership check: this order must belong to req.user
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        // 2. The order must have a stored Razorpay order ID.
        if (!order.razorpayOrderId) {
            return res.status(400).json({ message: "Razorpay order ID not found for this order." });
        }

        // 3. Server-side signature verification using HMAC SHA256.
        //    Standard Razorpay verification:
        //    HMAC(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        const isSignatureValid = expectedSignature === razorpay_signature;

        if (!isSignatureValid) {
            // Signature mismatch — payment is NOT verified.
            // Do NOT update order status, do NOT clear cart.
            return res.status(400).json({
                success: false,
                message: "Payment verification failed. Invalid signature."
            });
        }

        // 4. Signature verified. Update the ShopKart order.
        order.paymentStatus = "PAID";
        order.status = "PLACED";
        order.razorpayPaymentId = razorpay_payment_id;
        await order.save();

        // 5. Clear the customer's cart ONLY after successful verification.
        const customer = await Customer.findById(req.user._id);
        if (customer) {
            customer.cart = [];
            await customer.save();
        }

        // 6. Return success with order info needed by frontend.
        return res.status(200).json({
            success: true,
            message: "Payment verified successfully.",
            orderId: order._id,
            status: order.status
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /orders
// Returns all orders belonging to the authenticated Customer, newest first.
// Protected by isAuthenticated.
// ─────────────────────────────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            orders
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /orders/:id
// Returns a single order by ID. Enforces it belongs to the authenticated Customer.
// Protected by isAuthenticated.
// ─────────────────────────────────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid order ID." });
        }

        const order = await Order.findOne({
            _id: id,
            user: req.user._id  // ownership enforcement
        });

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        return res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
