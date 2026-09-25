import express from "express";
import { createProduct, getAllProducts, getProductById } from "../controllers/product.controller.js";

const productRoutes = express.Router();

productRoutes.post("/", createProduct);
productRoutes.get("/", getAllProducts);
productRoutes.get("/:id", getProductById);

export default productRoutes;


