import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const existingItem = customer.cart.find(
            (item) => item.product.toString() === productId
        );

        const newQuantity = existingItem ? existingItem.quantity + 1 : 1;

        if (newQuantity > product.stock) {
            return res.status(400).json({ message: "Quantity exceeds available stock" });
        }

        if (existingItem) {
            existingItem.quantity = newQuantity;
        } else {
            customer.cart.push({
                product: productId,
                quantity: 1
            });
        }

        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart: customer.cart
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getCart = async (req, res) => {
    try {
        const customer = await Customer.findById(req.user._id).populate({
            path: "cart.product",
            select: "name price category image stock"
        });

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        return res.status(200).json({
            success: true,
            count: customer.cart.length,
            cart: customer.cart
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        if (typeof quantity !== "number" || isNaN(quantity) || quantity < 1) {
            return res.status(400).json({ message: "Quantity must be a valid number and at least 1" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const cartItem = customer.cart.find(
            (item) => item.product && (item.product._id ? item.product._id.toString() : item.product.toString()) === productId
        );

        if (!cartItem) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (quantity > product.stock) {
            return res.status(400).json({ message: "Quantity exceeds available stock" });
        }

        cartItem.quantity = quantity;
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Cart updated successfully",
            cart: customer.cart
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const customer = await Customer.findById(req.user._id);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const itemIndex = customer.cart.findIndex(
            (item) => item.product && (item.product._id ? item.product._id.toString() : item.product.toString()) === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({ message: "Product not found in cart" });
        }

        customer.cart.splice(itemIndex, 1);
        await customer.save();

        return res.status(200).json({
            success: true,
            message: "Product removed from cart",
            cart: customer.cart
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
