import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const customer = await Customer.findById(decoded.customerId).select("-password");

        if (!customer) {
            return res.status(401).json({ message: "Customer not found or unauthorized." });
        }

        req.user = customer;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token." });
    }
};

export default isAuthenticated;
