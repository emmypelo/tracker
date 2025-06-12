import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Import routes

import taskRouter from "./routers/taskRouter.js";
import userRouter from "./routers/userRouter.js";
import categoryRouter from "./routers/categoryRouter.js";
import subCategoryRouter from "./routers/subCategoryRouter.js";
import regionRouter from "./routers/regionRouter.js";
import reportCategoryRouter from "./routers/reportCategoryRouter.js";
import stationRouter from "./routers/stationRouter.js";
import reportRouter from "./routers/reportRouter.js";
import { debugMiddleware } from "./middlewares/debugMiddleware.js";

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS configuration
const corsOptions = {
  // origin:"https://tracker.pingbyleo.space",
  origin:
    process.env.MODE === "production"
      ? ["https://tracker.pingbyleo.space", "https://pingbyleo.space"]
      : ["http://localhost:5173"],

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  credentials: true,
  preflightContinue: false,
};

app.use(cors(corsOptions));

app.use("/tasks", taskRouter);
app.use("/users", userRouter);
app.use("/category", categoryRouter);
app.use("/sub_category", subCategoryRouter);
app.use("/regions", regionRouter);
app.use("/reportcategory", reportCategoryRouter);
app.use("/stations", stationRouter);
app.use("/reports", reportRouter);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found on the server" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  });
