import mongoose from "mongoose";
import Product from "../models/product.model.js";

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, image, stock } = req.body;

        if (!name || !description || price === undefined || price === null || !category || !image || stock === undefined || stock === null) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (isNaN(price) || Number(price) <= 0) {
            return res.status(400).json({ message: "Invalid price" });
        }

        if (isNaN(stock) || Number(stock) < 0) {
            return res.status(400).json({ message: "Invalid stock" });
        }

        const newProduct = await Product.create({
            name,
            description,
            price: Number(price),
            category,
            image,
            stock: Number(stock)
        });

        return res.status(201).json(newProduct);
    } catch (error) {
        console.log(error);
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const { search, category } = req.query;

        const query = {};

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        if (category) {
            query.category = category;
        }

        const products = await Product.find(query);

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json(product);
    } catch (error) {
        console.log(error);
        if (error.name === "CastError") {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};


