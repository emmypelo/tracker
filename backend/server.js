import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import passport from "passport";
import { localStrategy, jwtStrategy } from "./utilities/passportConfig.js";
import cookieParser from "cookie-parser";
import taskRouter from "./routers/taskRouter.js";
import userRouter from "./routers/userRouter.js";
import categoryRouter from "./routers/categoryRouter.js";
import subCategoryRouter from "./routers/subCategoryRouter.js";
import regionRouter from "./routers/regionRouter.js";
import reportCategoryRouter from "./routers/reportCategoryRouter.js";
import stationRouter from "./routers/stationRouter.js";
import reportRouter from "./routers/reportRouter.js";

const app = express();
const port = process.env.PORT;

// Important: cookieParser should come before passport initialization
app.use(cookieParser());
app.use(express.json());

// Enhanced CORS configuration
const corsOptions = {
  origin:
    ["https://tracker-rust-zeta.vercel.app"],
  credentials: true, // This is crucial for cookies
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
};

app.use(cors(corsOptions));

// Debugging middleware to see what's happening with cookies
app.use((req, res, next) => {
  console.log("Cookies received:", req.cookies);
  console.log("Headers:", req.headers);
  next();
});

// Initialize passport after cookieParser
app.use(passport.initialize());

// Initialize strategies
localStrategy();
jwtStrategy();

// Routes
app.use("/api/tasks", taskRouter);
app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/sub_category", subCategoryRouter);
app.use("/api/regions", regionRouter);
app.use("/api/reportcategory", reportCategoryRouter);
app.use("/api/stations", stationRouter);
app.use("/api/reports", reportRouter);

app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found on the server" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const message = err.message;
  const stack = err.stack;
  res.status(500).json({ message, stack });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(port, () => {
      console.log("Connected to MongoDB & listening on port", port);
    });
  })
  .catch((error) => {
    console.log(error);
  });
