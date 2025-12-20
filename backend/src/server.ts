import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import sequelize from "./db";

// 🔗 Import associations (VERY IMPORTANT)
import "./db";

// Routes
import authRoutes from "./routes/auth.routes";
// import productRoutes from "./routes/product.routes";
// import orderRoutes from "./routes/order.routes";
import feedbackRoutes from "./routes/feedback.routes";
import messageRoutes from "./routes/message.routes";
import errorMiddleware from "./middleware/error.middleware";

import { protect } from "./middleware/auth.middleware";

dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 3000;

/*  MIDDLEWARE */
app.use(cors());
app.use(express.json());
app.use(errorMiddleware);




/*  ROUTES  */
app.use("/api/auth", authRoutes);
// app.use("/api/products", protect, productRoutes);
// app.use("/api/orders", protect, orderRoutes);
app.use("/api/feedback", protect, feedbackRoutes);
app.use("/api/messages", protect, messageRoutes);









/* 
 SERVER START 
 */
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ MySQL connected");

    await sequelize.sync({ alter: true });
    console.log("✅ Models synced");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
