import express from "express";
import {
    registerCustomer,
    loginCustomer,
    getProfile,
    logoutCustomer
} from "../controllers/customer.controller.js";
import isAuthenticated from "../middlewares/auth.middleware.js";

const customerRoutes = express.Router();

customerRoutes.post("/register", registerCustomer);
customerRoutes.post("/login", loginCustomer);
customerRoutes.get("/me", isAuthenticated, getProfile);
customerRoutes.post("/logout", isAuthenticated, logoutCustomer);

export default customerRoutes;
