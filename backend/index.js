import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import customerRoutes from "./routes/customer.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cookieParser());

app.use("/customers", customerRoutes);

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("DB Connected");
        app.listen(PORT, () => {
            console.log(`Server Started at ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
