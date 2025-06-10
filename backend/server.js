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

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(cookieParser());
app.use(express.json());

// Enhanced CORS configuration for Safari compatibility
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins =
      process.env.NODE_ENV === "production"
        ? ["https://tracker-rust-zeta.vercel.app"]
        : ["http://localhost:5173", "http://127.0.0.1:5173"];

    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Cookie",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control",
    "Pragma",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200, 
  preflightContinue: false,
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly for better Safari support
app.options("*", cors(corsOptions));

app.use((req, res, next) => {
  
  if (process.env.NODE_ENV === "production") {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Vary", "Origin");
  }
  next();
});

// Routes
app.use(debugMiddleware);
// app.use("/api/users", userRouter);
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
    status: "success",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found on the server" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);

  // Handle CORS errors specifically
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      status: "error",
      message: "CORS policy violation",
    });
  }

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
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(
        `CORS enabled for: ${
          process.env.NODE_ENV === "production"
            ? "https://tracker-rust-zeta.vercel.app"
            : "localhost:5173"
        }`
      );
    });
  })
  .catch((error) => {
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  });
