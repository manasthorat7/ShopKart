import express from "express";
import {
    createPaymentOrder,
    verifyPayment,
    getMyOrders,
    getOrderById
} from "../controllers/order.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const orderRoutes = express.Router();

orderRoutes.post("/create-payment-order", isAuthenticated, createPaymentOrder);
orderRoutes.post("/verify-payment", isAuthenticated, verifyPayment);
orderRoutes.get("/", isAuthenticated, getMyOrders);
orderRoutes.get("/:id", isAuthenticated, getOrderById);

export default orderRoutes;
