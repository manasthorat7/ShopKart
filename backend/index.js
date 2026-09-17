import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import customerRoutes from "./routes/customer.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "http://localhost:5173");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

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
