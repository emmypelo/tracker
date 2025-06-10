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

// CORS configuration - Updated for your domains
const corsOptions = {
  origin: [
    "https://tracker.pingbyleo.com",
    "http://localhost:3000", // For development
    "http://localhost:5173", // For Vite dev server
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control",
    "Pragma",
  ],
  optionsSuccessStatus: 200, // For legacy browser support
  maxAge: 86400, // 24 hours for preflight cache
};

// Apply CORS middleware first
app.use(cors(corsOptions));

// Handle preflight requests explicitly for all routes
app.options("*", (req, res) => {
  const origin = req.headers.origin;

  if (corsOptions.origin.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "86400");

  res.status(200).end();
});

// Additional CORS middleware to ensure headers are always set
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // Log incoming requests for debugging
  console.log(`${req.method} ${req.path} from origin: ${origin}`);

  // Set CORS headers manually as backup
  if (corsOptions.origin.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }

  next();
});

// Routes
app.use(debugMiddleware);
app.use("/api/auth", userRouter);
app.use("/api/tasks", taskRouter);
app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/sub_category", subCategoryRouter);
app.use("/api/regions", regionRouter);
app.use("/api/reportcategory", reportCategoryRouter);
app.use("/api/stations", stationRouter);
app.use("/api/reports", reportRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is running",
    cors: "Enabled for tracker.pingbyleo.com",
  });
});

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
    console.log("Connected to MongoDB successfully");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`CORS enabled for: ${corsOptions.origin.join(", ")}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  });
