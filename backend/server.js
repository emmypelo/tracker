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

// Trust proxy (important for Render/Heroku deployments)
app.set("trust proxy", 1);

// Middleware
app.use(cookieParser());
app.use(express.json());

const allowedOrigins = "https://tracker.pingbyleo.space";

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  // Enhanced logging
  console.log(`\n=== ${req.method} ${req.path} ===`);
  console.log(`Origin: ${origin || "undefined"}`);
  console.log(`Referer: ${referer || "undefined"}`);
  console.log(`Host: ${req.headers.host}`);
  console.log(
    `X-Forwarded-For: ${req.headers["x-forwarded-for"] || "undefined"}`
  );
  console.log(`User-Agent: ${req.headers["user-agent"]?.substring(0, 50)}...`);

  // Always set CORS headers for allowed origins
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    console.log(`✅ CORS allowed for origin: ${origin}`);
  } else if (!origin) {
    res.header("Access-Control-Allow-Origin", "*");
    console.log("✅ CORS allowed for request without origin");
  } else {
    console.log(`❌ CORS blocked for origin: ${origin}`);
  }

  // Set CORS headers
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma, X-Forwarded-For"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "86400");

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    console.log("✅ Handling OPTIONS preflight request");
    return res.status(200).end();
  }

  console.log("=== End Request Log ===\n");
  next();
});

// Backup CORS using cors package
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS package blocked origin: ${origin}`);
        callback(null, false); // Don't throw error, just deny
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cache-Control",
      "Pragma",
      "X-Forwarded-For",
    ],
    optionsSuccessStatus: 200,
  })
);

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
    message: "Server is running with CORS enabled",
    allowedOrigins: allowedOrigins,
    requestOrigin: req.headers.origin || "No origin header",
    timestamp: new Date().toISOString(),
    headers: {
      origin: req.headers.origin,
      referer: req.headers.referer,
      host: req.headers.host,
      userAgent: req.headers["user-agent"]?.substring(0, 100),
    },
  });
});

// Simple CORS test endpoint
app.get("/api/cors-test", (req, res) => {
  res.json({
    message: "CORS test successful!",
    origin: req.headers.origin,
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
    console.log("✅ Connected to MongoDB successfully");
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
      console.log(`🌐 CORS enabled for origins:`);
      console.log(allowedOrigins);
      console.log(`📍 Health check: https://pingbyleo.space/health`);
      console.log(`🧪 CORS test: https://pingbyleo.space/api/cors-test`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  });
