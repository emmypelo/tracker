import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "../models/User.js";
import sendPasswordMail from "../utilities/sendPasswordMail.js";
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

// Safari-specific cookie options to force storage
const getCookieOptions = (req = null) => {
  const isProduction = process.env.NODE_ENV === "production";
  const isSafari = req?.isSafari || false;

  const baseOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  };

  // Safari-specific modifications
  if (isProduction && isSafari) {
    // For Safari, try with partitioned attribute for third-party cookies
    baseOptions.partitioned = true;

    // Shorter maxAge for Safari to avoid ITP issues
    baseOptions.maxAge = 24 * 60 * 60 * 1000; // 1 day for Safari

    console.log("Safari detected - using partitioned cookies");
  }

  return baseOptions;
};

// Alternative cookie options without partitioned (fallback)
const getFallbackCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
    // No partitioned attribute
  };
};

// Enhanced cookie clearing for Safari
const clearCookieOptions = (req = null) => {
  const isProduction = process.env.NODE_ENV === "production";
  const isSafari = req?.isSafari || false;

  const clearOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  };

  if (isProduction && isSafari) {
    clearOptions.partitioned = true;
  }

  return clearOptions;
};

// Safari cookie setting helper with multiple attempts
const setSafariCompatibleCookie = (res, req, name, value) => {
  const isProduction = process.env.NODE_ENV === "production";
  const isSafari = req?.isSafari || false;

  if (isProduction && isSafari) {
    // Try multiple cookie setting strategies for Safari

    // Strategy 1: With partitioned attribute
    try {
      res.cookie(name, value, getCookieOptions(req));
    } catch (error) {
      console.log("Partitioned cookie failed, trying fallback");
    }

    // Strategy 2: Without partitioned (fallback)
    res.cookie(name + "_fallback", value, getFallbackCookieOptions());

    // Strategy 3: Manual Set-Cookie header
    const cookieString = `${name}=${value}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${
      7 * 24 * 60 * 60
    }`;
    res.setHeader(
      "Set-Cookie",
      [res.getHeader("Set-Cookie") || [], cookieString].flat().filter(Boolean)
    );
  } else {
    // Standard cookie setting for non-Safari browsers
    res.cookie(name, value, getCookieOptions(req));
  }
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

  // Create a new user with Safari cookie fix
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

      // Set cookie with Safari compatibility
      setSafariCompatibleCookie(res, req, "TrackIt", token);

      // Log for debugging
      if (process.env.NODE_ENV === "production") {
        console.log("User created, Safari detected:", req.isSafari);
        console.log("Cookie options used:", getCookieOptions(req));
      }

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
        safariDetected: req.isSafari,
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

  // Login user with enhanced Safari cookie storage
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

      // Set cookie with Safari compatibility
      setSafariCompatibleCookie(res, req, "TrackIt", token);

      // Additional Safari debugging
      if (process.env.NODE_ENV === "production" && req.isSafari) {
        console.log("Safari login - multiple cookie strategies applied");
        console.log("User-Agent:", req.get("User-Agent"));
      }

      return sendResponse(res, 200, "success", "Login Success", {
        isAuthenticated: true,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        _id: user._id,
        role: user.role || "user",
        safariDetected: req.isSafari,
        cookieStrategies: req.isSafari ? "multiple" : "standard",
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

  // Enhanced authentication check with Safari fallback
  checkAuthentication: asyncHandler(async (req, res) => {
    // Try multiple cookie sources for Safari compatibility
    const token = req.cookies?.TrackIt || req.cookies?.TrackIt_fallback;

    if (!token) {
      return sendResponse(res, 401, "error", "User is not authenticated", {
        isAuthenticated: false,
        safariDetected: req.isSafari,
      });
    }

    try {
      const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
      const userIdFromToken = decodedUser.id;

      if (!userIdFromToken) {
        // Clear all cookie variants
        res.cookie("TrackIt", "", clearCookieOptions(req));
        res.cookie("TrackIt_fallback", "", clearCookieOptions(req));
        return sendResponse(
          res,
          401,
          "error",
          "Invalid token: missing user ID",
          {
            isAuthenticated: false,
          }
        );
      }

      const userIdString = String(userIdFromToken);

      if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        res.cookie("TrackIt", "", clearCookieOptions(req));
        res.cookie("TrackIt_fallback", "", clearCookieOptions(req));
        return sendResponse(res, 401, "error", "Invalid user ID format", {
          isAuthenticated: false,
        });
      }

      const user = await User.findById(userIdString).select(
        "-password -authMethod -passwordResetToken -passwordResetExpires"
      );

      if (!user) {
        res.cookie("TrackIt", "", clearCookieOptions(req));
        res.cookie("TrackIt_fallback", "", clearCookieOptions(req));
        return sendResponse(res, 401, "error", "User not found", {
          isAuthenticated: false,
        });
      }

      // Refresh token if close to expiry
      const tokenExp = new Date(decodedUser.exp * 1000);
      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;

      if (tokenExp.getTime() - now.getTime() < oneDay) {
        const newToken = generateToken(user);
        setSafariCompatibleCookie(res, req, "TrackIt", newToken);
      }

      return sendResponse(res, 200, "success", "User is authenticated", {
        isAuthenticated: true,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        _id: user._id,
        role: user.role || "user",
        safariDetected: req.isSafari,
        cookieSource: req.cookies?.TrackIt ? "primary" : "fallback",
      });
    } catch (error) {
      // Clear all cookie variants
      res.cookie("TrackIt", "", clearCookieOptions(req));
      res.cookie("TrackIt_fallback", "", clearCookieOptions(req));

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

  // Enhanced logout with Safari cookie clearing
  logout: asyncHandler(async (req, res) => {
    // Clear all cookie variants for Safari
    res.cookie("TrackIt", "", clearCookieOptions(req));
    res.cookie("TrackIt_fallback", "", clearCookieOptions(req));

    // Additional clearing methods for Safari
    if (process.env.NODE_ENV === "production") {
      res.clearCookie("TrackIt", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
      res.clearCookie("TrackIt_fallback", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
      });
    }

    return sendResponse(res, 200, "success", "Logged out successfully", {
      safariDetected: req.isSafari,
    });
  }),

  // Fetch all users (unchanged)
  fetchAllUsers: asyncHandler(async (req, res) => {
    try {
      const page = Number.parseInt(req.query.page) || 1;
      const limit = Number.parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const { name } = req.query;
      const filter = {};

      if (name) {
        filter.$or = [
          { firstname: { $regex: name, $options: "i" } },
          { lastname: { $regex: name, $options: "i" } },
          { email: { $regex: name.toLowerCase(), $options: "i" } },
          { role: { $regex: name, $options: "i" } },
        ];
      }

      const users = await User.find(filter)
        .select(
          "-password -authMethod -passwordResetToken -passwordResetExpires"
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await User.countDocuments(filter);

      return sendResponse(res, 200, "success", "Users fetched successfully", {
        users,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit,
        },
      });
    } catch (error) {
      return sendResponse(
        res,
        500,
        "error",
        "Failed to fetch users",
        null,
        error.message
      );
    }
  }),

  // Fetch a user (unchanged)
  fetchAUser: asyncHandler(async (req, res) => {
    try {
      const userId = req.params.userId;

      if (!userId) {
        return sendResponse(res, 400, "error", "User ID is required");
      }

      const user = await User.findById(userId).select(
        "-password -authMethod -passwordResetToken -passwordResetExpires"
      );

      if (!user) {
        return sendResponse(res, 404, "error", "User not found");
      }

      return sendResponse(res, 200, "success", "User fetched successfully", {
        user,
      });
    } catch (error) {
      return sendResponse(
        res,
        500,
        "error",
        "Failed to fetch user",
        null,
        error.message
      );
    }
  }),

  // Forgot password (unchanged)
  forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, 400, "error", "Email is required");
    }

    try {
      const lowerCaseEmail = email.toLowerCase();
      const user = await User.findOne({ email: lowerCaseEmail });
      if (!user) {
        return sendResponse(
          res,
          200,
          "success",
          `If a user with that email exists, a password reset link has been sent`
        );
      }

      const token = await user.generatePasswordResetToken();
      await user.save();
      await sendPasswordMail(user.email, token);

      return sendResponse(
        res,
        200,
        "success",
        `If a user with that email exists, a password reset link has been sent`
      );
    } catch (error) {
      if (error.message.includes("Gmail authentication")) {
        return sendResponse(
          res,
          500,
          "error",
          "Email service configuration error. Please contact support."
        );
      }
      return sendResponse(
        res,
        500,
        "error",
        "An error occurred while processing your request. Please try again later."
      );
    }
  }),

  // Reset password with Safari cookie support
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

      // Generate new token and set with Safari compatibility
      const token = generateToken(userFound);
      setSafariCompatibleCookie(res, req, "TrackIt", token);

      return sendResponse(res, 200, "success", "Password successfully reset", {
        isAuthenticated: true,
        safariDetected: req.isSafari,
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

  // Delete user with Safari cookie clearing
  deleteUser: asyncHandler(async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return sendResponse(res, 400, "error", "User ID is required");
      }

      const currentUserId = safeObjectId(req.user.id);
      if (!currentUserId) {
        return sendResponse(res, 401, "error", "Invalid authentication");
      }

      const currentUser = await User.findById(currentUserId);
      if (!currentUser) {
        return sendResponse(res, 401, "error", "Authentication failed");
      }

      if (
        currentUser.role !== "admin" &&
        currentUser._id.toString() !== userId
      ) {
        return sendResponse(
          res,
          403,
          "error",
          "Unauthorized to delete this user"
        );
      }

      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        return sendResponse(res, 404, "error", "User not found");
      }

      // If user deletes their own account, clear all cookies
      if (currentUser._id.toString() === userId) {
        res.cookie("TrackIt", "", clearCookieOptions(req));
        res.cookie("TrackIt_fallback", "", clearCookieOptions(req));
      }

      return sendResponse(res, 200, "success", "User deleted successfully");
    } catch (error) {
      return sendResponse(
        res,
        500,
        "error",
        "An error occurred while processing your request",
        null,
        error.message
      );
    }
  }),

  // Edit user profile (unchanged)
  editUserProfile: asyncHandler(async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return sendResponse(res, 400, "error", "User ID is required");
      }

      const userToEdit = await User.findById(userId);
      if (!userToEdit) {
        return sendResponse(res, 404, "error", "User not found");
      }

      const currentUserId = safeObjectId(req.user.id);
      if (!currentUserId) {
        return sendResponse(res, 401, "error", "Invalid authentication");
      }

      const currentUser = await User.findById(currentUserId);
      if (!currentUser) {
        return sendResponse(res, 401, "error", "Authentication failed");
      }

      const isOwnProfile = currentUser._id.toString() === userId;
      const isAdmin = currentUser.role === "admin";

      if (!isOwnProfile && !isAdmin) {
        return sendResponse(
          res,
          403,
          "error",
          "Unauthorized to edit this profile"
        );
      }

      const { firstname, lastname, email } = req.body;
      const updateData = {};

      if (firstname) updateData.firstname = firstname;
      if (lastname) updateData.lastname = lastname;

      if (email && email !== userToEdit.email) {
        const lowerCaseEmail = email.toLowerCase();
        const emailExists = await User.findOne({
          email: lowerCaseEmail,
          _id: { $ne: userId },
        });
        if (emailExists) {
          return sendResponse(res, 400, "error", "Email is already in use");
        }
        updateData.email = lowerCaseEmail;
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select(
        "-password -authMethod -passwordResetToken -passwordResetExpires"
      );

      return sendResponse(res, 200, "success", "Profile updated successfully", {
        user: updatedUser,
      });
    } catch (error) {
      return sendResponse(
        res,
        500,
        "error",
        "An error occurred while processing your request",
        null,
        error.message
      );
    }
  }),

  // Admin edit user (unchanged)
  adminEditUser: asyncHandler(async (req, res) => {
    try {
      const currentUserId = safeObjectId(req.user.id);
      if (!currentUserId) {
        return sendResponse(res, 401, "error", "Invalid authentication");
      }

      const currentUser = await User.findById(currentUserId);
      if (!currentUser) {
        return sendResponse(res, 401, "error", "Authentication failed");
      }

      if (currentUser.role !== "admin") {
        return sendResponse(res, 403, "error", "Unauthorized: Admins only");
      }

      const { userId } = req.params;

      if (!userId) {
        return sendResponse(res, 400, "error", "User ID is required");
      }

      const userToEdit = await User.findById(userId);
      if (!userToEdit) {
        return sendResponse(res, 404, "error", "User not found");
      }

      const { firstname, lastname, email, role } = req.body;
      const updateData = {};

      if (firstname) updateData.firstname = firstname;
      if (lastname) updateData.lastname = lastname;

      if (email && email !== userToEdit.email) {
        const lowerCaseEmail = email.toLowerCase();
        const emailExists = await User.findOne({
          email: lowerCaseEmail,
          _id: { $ne: userId },
        });
        if (emailExists) {
          return sendResponse(res, 400, "error", "Email is already in use");
        }
        updateData.email = lowerCaseEmail;
      }

      if (role) {
        const allowedRoles = ["user", "admin", "manager"];
        if (!allowedRoles.includes(role)) {
          return sendResponse(res, 400, "error", "Invalid role specified");
        }

        if (userToEdit.role === "admin" && role !== "admin") {
          const adminCount = await User.countDocuments({ role: "admin" });
          if (adminCount <= 1) {
            return sendResponse(
              res,
              400,
              "error",
              "Cannot change the role of the last admin"
            );
          }
        }

        updateData.role = role;
      }

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select(
        "-password -authMethod -passwordResetToken -passwordResetExpires"
      );

      return sendResponse(res, 200, "success", "User updated successfully", {
        user: updatedUser,
      });
    } catch (error) {
      return sendResponse(
        res,
        500,
        "error",
        "An error occurred while processing your request",
        null,
        error.message
      );
    }
  }),

  // Change password with Safari cookie support
  changePassword: asyncHandler(async (req, res) => {
    try {
      const { userId } = req.params;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (!currentPassword || !newPassword || !confirmPassword) {
        return sendResponse(
          res,
          400,
          "error",
          "All password fields are required"
        );
      }

      if (newPassword !== confirmPassword) {
        return sendResponse(res, 400, "error", "New passwords don't match");
      }

      if (newPassword.length < 8) {
        return sendResponse(
          res,
          400,
          "error",
          "Password must be at least 8 characters"
        );
      }

      const currentUserId = safeObjectId(req.user.id);
      if (!currentUserId) {
        return sendResponse(res, 401, "error", "Invalid authentication");
      }

      const currentUser = await User.findById(currentUserId);
      if (!currentUser) {
        return sendResponse(res, 401, "error", "Authentication failed");
      }

      if (
        currentUser._id.toString() !== userId &&
        currentUser.role !== "admin"
      ) {
        return sendResponse(
          res,
          403,
          "error",
          "Unauthorized to change this user's password"
        );
      }

      const user = await User.findById(userId);
      if (!user) {
        return sendResponse(res, 404, "error", "User not found");
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return sendResponse(res, 400, "error", "Current password is incorrect");
      }

      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      // Generate new token and set with Safari compatibility
      const token = generateToken(user);
      setSafariCompatibleCookie(res, req, "TrackIt", token);

      return sendResponse(
        res,
        200,
        "success",
        "Password changed successfully",
        {
          safariDetected: req.isSafari,
        }
      );
    } catch (error) {
      return sendResponse(
        res,
        500,
        "error",
        "An error occurred while changing password",
        null,
        error.message
      );
    }
  }),
};

export default userController;
