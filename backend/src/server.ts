import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import crypto from "crypto";
import { protect } from "./middleware/auth.middleware";

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/product", protect, productRoutes);
app.use("/order", protect, orderRoutes);

app.get("/", (_req: Request, res: Response) => {
  res.send("API is running...");
});

// Generate a 64-byte (512-bit) hex secret
const secret: string = crypto.randomBytes(64).toString("hex");
console.log("Generated secret:", secret);

const PORT: number = Number(process.env.PORT) || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
