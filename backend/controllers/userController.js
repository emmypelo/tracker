import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/User.js";
import { sendResponse } from "../utilities/sendResponse.js";

// Helper function to safely convert any ID format to a valid ObjectId string
const safeObjectId = (id) => {
  try {
    if (Buffer.isBuffer(id)) {
      id = id.toString("hex");
    }
    if (mongoose.Types.ObjectId.isValid(id)) {
      return id.toString();
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role || "user",
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// Fixed cookie options for better Safari compatibility
const getCookieOptions = (req) => {
  const isProduction = process.env.NODE_ENV === "production";
  const origin = req.get("origin") || req.get("referer");
  const isCrossOrigin = origin && !origin.includes(req.get("host"));

  return {
    httpOnly: true,
    secure: isProduction, // Always secure in production
    sameSite: isProduction && isCrossOrigin ? "none" : "lax", // Use 'lax' for same-origin, 'none' for cross-origin
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/", // Explicitly set path
    domain: isProduction ? process.env.COOKIE_DOMAIN : undefined, // Set domain in production if needed
  };
};

const userController = {
  // Check if user exists
  checkUserExist: asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, 400, "error", "Email is required");
    }

    try {
      const lowerCaseEmail = email.toLowerCase();
      const userExist = await User.findOne({ email: lowerCaseEmail });
      const message = userExist ? "User exists" : "User does not exist";
      return sendResponse(res, 200, "success", message, {
        userExists: Boolean(userExist),
      });
    } catch (error) {
      return sendResponse(
        res,
        500,
        "error",
        "Error checking user existence",
        null,
        error.message
      );
    }
  }),

  // Create a new user
  createUser: asyncHandler(async (req, res) => {
    const { firstname, lastname, email, password, passmatch } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !email || !password || !passmatch) {
      return sendResponse(res, 400, "error", "All fields are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendResponse(res, 400, "error", "Invalid email format");
    }

    // Ensure passwords match
    if (password !== passmatch) {
      return sendResponse(res, 400, "error", "Passwords don't match");
    }

    // Validate password strength
    if (password.length < 8) {
      return sendResponse(
        res,
        400,
        "error",
        "Password must be at least 8 characters"
      );
    }

    try {
      const lowerCaseEmail = email.toLowerCase();

      // Check if user already exists
      const userExist = await User.findOne({ email: lowerCaseEmail });
      if (userExist) {
        return sendResponse(res, 400, "error", "User already exists");
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const newUser = await User.create({
        firstname,
        lastname,
        email: lowerCaseEmail,
        password: hashedPassword,
      });

      // Generate token for auto-login after registration
      const token = generateToken(newUser);

      // Set token in cookie with improved options
      res.cookie("TrackIt", token, getCookieOptions(req));

      // Remove password from response
      const userResponse = {
        _id: newUser._id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        role: newUser.role || "user",
      };

      return sendResponse(res, 201, "success", "User created successfully", {
        user: userResponse,
        isAuthenticated: true,
        token: process.env.NODE_ENV === "development" ? token : undefined,
      });
    } catch (error) {
      return sendResponse(
        res,
        500,
        "error",
        "Server Error",
        null,
        error.message
      );
    }
  }),

  // Login user with improved cookie handling
  loginUser: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendResponse(res, 400, "error", "Email and password are required");
    }

    try {
      const lowerCaseEmail = email.toLowerCase();

      // Find user by email
      const user = await User.findOne({ email: lowerCaseEmail });
      if (!user) {
        return sendResponse(res, 401, "error", "Invalid email or password");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return sendResponse(res, 401, "error", "Invalid email or password");
      }

      // Generate JWT token
      const token = generateToken(user);

      // Clear any existing cookie first
      res.clearCookie("TrackIt", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
      });

      // Set new token in cookie with improved options
      res.cookie("TrackIt", token, getCookieOptions(req));

      // Also set CORS headers if needed
      const origin = req.get("origin");
      if (origin) {
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Origin", origin);
      }

      return sendResponse(res, 200, "success", "Login Success", {
        isAuthenticated: true,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        _id: user._id,
        role: user.role || "user",
        token: process.env.NODE_ENV === "development" ? token : undefined,
      });
    } catch (error) {
      return sendResponse(
        res,
        500,
        "error",
        "Login failed",
        null,
        error.message
      );
    }
  }),

  // Improved authentication check
  checkAuthentication: asyncHandler(async (req, res) => {
    // Get token from cookie with fallback to Authorization header
    let token = req.cookies?.TrackIt;

    // Fallback to Authorization header if cookie is not present
    if (!token && req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return sendResponse(res, 401, "error", "User is not authenticated", {
        isAuthenticated: false,
      });
    }

    try {
      // Verify the JWT token
      const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
      const userIdFromToken = decodedUser.id;

      if (!userIdFromToken) {
        // Clear invalid cookie
        res.clearCookie("TrackIt", getCookieOptions(req));
        return sendResponse(
          res,
          401,
          "error",
          "Invalid token: missing user ID",
          { isAuthenticated: false }
        );
      }

      const userIdString = String(userIdFromToken);

      if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        res.clearCookie("TrackIt", getCookieOptions(req));
        return sendResponse(res, 401, "error", "Invalid user ID format", {
          isAuthenticated: false,
        });
      }

      const user = await User.findById(userIdString).select(
        "-password -authMethod -passwordResetToken -passwordResetExpires"
      );

      if (!user) {
        res.clearCookie("TrackIt", getCookieOptions(req));
        return sendResponse(res, 401, "error", "User not found", {
          isAuthenticated: false,
        });
      }

      // Refresh token if it's close to expiry
      const tokenExp = new Date(decodedUser.exp * 1000);
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;

      if (tokenExp.getTime() - now.getTime() < oneDay) {
        const newToken = generateToken(user);
        res.cookie("TrackIt", newToken, getCookieOptions(req));
      }

      return sendResponse(res, 200, "success", "User is authenticated", {
        isAuthenticated: true,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        _id: user._id,
        role: user.role || "user",
      });
    } catch (error) {
      // Clear invalid token
      res.clearCookie("TrackIt", getCookieOptions(req));

      if (error.name === "JsonWebTokenError") {
        return sendResponse(res, 401, "error", "Invalid authentication token", {
          isAuthenticated: false,
        });
      } else if (error.name === "TokenExpiredError") {
        return sendResponse(res, 401, "error", "Authentication token expired", {
          isAuthenticated: false,
        });
      }

      return sendResponse(
        res,
        401,
        "error",
        "Authentication failed",
        { isAuthenticated: false },
        error.message
      );
    }
  }),

  // Improved logout
  logout: asyncHandler(async (req, res) => {
    // Clear cookie with same options used to set it
    res.clearCookie("TrackIt", getCookieOptions(req));

    // Also clear with different sameSite values to ensure compatibility
    res.clearCookie("TrackIt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.clearCookie("TrackIt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      path: "/",
    });

    return sendResponse(res, 200, "success", "Logged out successfully");
  }),

  // ... (rest of your methods remain the same)
  // I'm including the key methods that needed cookie fixes

  // Reset password with improved cookie handling
  resetPassword: asyncHandler(async (req, res) => {
    const { verifyToken } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return sendResponse(
        res,
        400,
        "error",
        "Password and confirmation are required"
      );
    }

    if (password !== confirmPassword) {
      return sendResponse(res, 400, "error", "Passwords don't match");
    }

    if (password.length < 8) {
      return sendResponse(
        res,
        400,
        "error",
        "Password must be at least 8 characters"
      );
    }

    try {
      const cryptoToken = crypto
        .createHash("sha256")
        .update(verifyToken)
        .digest("hex");

      const userFound = await User.findOne({
        passwordResetToken: cryptoToken,
        passwordResetExpires: { $gt: Date.now() },
      });

      if (!userFound) {
        return sendResponse(
          res,
          400,
          "error",
          "Password reset token is invalid or has expired"
        );
      }

      const salt = await bcrypt.genSalt(12);
      userFound.password = await bcrypt.hash(password, salt);
      userFound.passwordResetToken = null;
      userFound.passwordResetExpires = null;

      await userFound.save();

      // Generate a new token and log the user in automatically
      const token = generateToken(userFound);
      res.cookie("TrackIt", token, getCookieOptions(req));

      return sendResponse(res, 200, "success", "Password successfully reset", {
        isAuthenticated: true,
      });
    } catch (error) {
      return sendResponse(
        res,
        500,
        "error",
        "An error occurred while resetting your password",
        null,
        error.message
      );
    }
  }),
};

export default userController;
