import jwt from "jsonwebtoken";
import User from "../models/User.js";
import mongoose from "mongoose"; // 
import asyncHandler from "express-async-handler";
import { sendResponse } from "../utilities/sendResponse.js";


const safeObjectId = (id) => {
  try {
    if (Buffer.isBuffer(id)) {
      id = id.toString("hex");
    }
    if (mongoose.Types.ObjectId.isValid(id)) {
      return id.toString();
    }
    console.error("Invalid ObjectId format:", id);
    return null;
  } catch (error) {
    console.error("Error converting ID:", error);
    return null;
  }
};

// Protect routes
export const isAuthenticated = asyncHandler(async (req, res, next) => {
  // Get token from cookie or Authorization header
  let token = req.cookies?.TrackIt;

  // If no cookie, check Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return sendResponse(res, 401, "error", "Not authorized, no token");
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from the token
    const userId = safeObjectId(decoded.id);
    if (!userId) {
      return sendResponse(res, 401, "error", "Invalid user ID");
    }

    req.user = await User.findById(userId).select("-password");
    if (!req.user) {
      return sendResponse(res, 401, "error", "User not found");
    }

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    // Clear invalid token
    res.cookie("TrackIt", "", { maxAge: 1 });

    if (error.name === "JsonWebTokenError") {
      return sendResponse(res, 401, "error", "Invalid token");
    }

    if (error.name === "TokenExpiredError") {
      return sendResponse(res, 401, "error", "Token expired");
    }

    return sendResponse(res, 401, "error", "Not authorized");
  }
});

// Admin middleware
export const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return sendResponse(res, 403, "error", "Not authorized as an admin");
  }
};

// Manager middleware
export const manager = (req, res, next) => {
  if (req.user && (req.user.role === "admin" || req.user.role === "manager")) {
    next();
  } else {
    return sendResponse(res, 403, "error", "Not authorized as a manager");
  }
};
