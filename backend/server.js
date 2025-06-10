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

// CORS MUST BE FIRST - before any other middleware
const allowedOrigins = [
  "https://tracker.pingbyleo.space",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
];


app.options("*", (req, res) => {
  const origin = req.headers.origin;

  console.log(`OPTIONS preflight request from origin: ${origin}`);

  // Set CORS headers for preflight
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    res.header("Access-Control-Allow-Origin", "*");
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "86400");

  console.log("✅ OPTIONS preflight handled successfully");
  return res.status(200).end();
});

// Primary CORS middleware for actual requests
app.use((req, res, next) => {
  const origin = req.headers.origin;

  console.log(
    `${req.method} ${req.path} from origin: ${origin || "undefined"}`
  );

  // Set CORS headers for actual requests
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else if (!origin) {
    res.header("Access-Control-Allow-Origin", "*");
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma"
  );

  next();
});

// NOW add other middleware AFTER CORS
app.use(cookieParser());
app.use(express.json());

// Backup CORS using cors package (after manual handling)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
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
    ],
    optionsSuccessStatus: 200,
  })
);

// Debug middleware AFTER CORS
app.use(debugMiddleware);

// Routes - AFTER all middleware
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
  });
});

// CORS test endpoint
app.get("/api/cors-test", (req, res) => {
  res.json({
    message: "CORS test successful!",
    origin: req.headers.origin,
    method: req.method,
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
      allowedOrigins.forEach((origin) => console.log(`   - ${origin}`));
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    throw new Error(`Failed to connect to MongoDB: ${error.message}`);
  });
