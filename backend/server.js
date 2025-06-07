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

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cookieParser());
app.use(express.json());

// CORS configuration
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? ["https://tracker-rust-zeta.vercel.app"]
      : ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));

// Debug middleware (remove in production)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log("Cookies:", req.cookies);
  next();
});

// Routes
app.use("/api/auth", userRouter);

// Protected routes (add authenticateToken middleware to protect these)
app.use("/api/tasks", taskRouter);
app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/sub_category", subCategoryRouter);
app.use("/api/regions", regionRouter);
app.use("/api/reportcategory", reportCategoryRouter);
app.use("/api/stations", stationRouter);
app.use("/api/reports", reportRouter);

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
      console.log(`Connected to MongoDB & listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection error:", error);
  });
