import express from "express";
import cors from "cors";
import { getProducts, getProductDetails } from "./controllers/product.controller.js";

const app = express();
app.use(cors());

app.get("/api/products/search", getProducts);
app.get("/api/products/details", getProductDetails);

export default app;