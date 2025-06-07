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
    // If id is a Buffer, convert to string
    if (Buffer.isBuffer(id)) {
      id = id.toString("hex");
    }

    // If id is already a valid ObjectId, return its string representation
    if (mongoose.Types.ObjectId.isValid(id)) {
      return id.toString();
    }

    // If we have a string that's not in ObjectId format, return null
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
      expiresIn: "7d", // Extended to 7 days for better user experience
    }
  );
};

// Set cookie options based on environment
const getCookieOptions = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only secure in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' for cross-origin in production
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
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
      // Convert email to lowercase
      const lowerCaseEmail = email.toLowerCase();

      // Check if user already exists
      const userExist = await User.findOne({ email: lowerCaseEmail });
      if (userExist) {
        return sendResponse(res, 400, "error", "User already exists");
      }

      // Hash password
      const salt = await bcrypt.genSalt(12); // Increased from 10 to 12 for better security
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

      // Set token in cookie
      res.cookie("TrackIt", token, getCookieOptions());

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
        token: process.env.NODE_ENV === "development" ? token : undefined, // Only include token in development
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

  // User login - Replaced Passport with direct JWT authentication
  loginUser: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return sendResponse(res, 400, "error", "Email and password are required");
    }

    try {
      // Convert email to lowercase
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

      // Set token in cookie
      res.cookie("TrackIt", token, getCookieOptions());

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

  // Fetch all users
  fetchAllUsers: asyncHandler(async (req, res) => {
    try {
      // Add pagination
      const page = Number.parseInt(req.query.page) || 1;
      const limit = Number.parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const { name, email, role } = req.query;
      const filter = {};

      // Enhanced filtering options
      if (name) {
        filter.$or = [
          { firstname: { $regex: name, $options: "i" } },
          { lastname: { $regex: name, $options: "i" } },
        ];
      }

      if (email) {
        filter.email = { $regex: email.toLowerCase(), $options: "i" };
      }

      if (role) {
        filter.role = role;
      }

      const users = await User.find(filter)
        .select(
          "-password -authMethod -passwordResetToken -passwordResetExpires"
        )
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Sort by newest first

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

  // Fetch a user
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

  // Check authentication status
  checkAuthentication: asyncHandler(async (req, res) => {
    // Get token from cookie only
    const token = req.cookies?.TrackIt;

    if (!token) {
      return sendResponse(res, 401, "error", "User is not authenticated", {
        isAuthenticated: false,
      });
    }

    try {
      // Verify the JWT token
      const decodedUser = jwt.verify(token, process.env.JWT_SECRET);

      // CRITICAL FIX: Extract the user ID and validate it properly
      const userIdFromToken = decodedUser.id;

      // Validate that we have a user ID
      if (!userIdFromToken) {
        res.cookie("TrackIt", "", { maxAge: 1 });
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

      // Convert to string and validate ObjectId format
      const userIdString = String(userIdFromToken);

      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userIdString)) {
        res.cookie("TrackIt", "", { maxAge: 1 });
        return sendResponse(res, 401, "error", "Invalid user ID format", {
          isAuthenticated: false,
        });
      }

      // CRITICAL: Use the validated userIdString, NOT any other variable
      const user = await User.findById(userIdString).select(
        "-password -authMethod -passwordResetToken -passwordResetExpires"
      );

      if (!user) {
        res.cookie("TrackIt", "", { maxAge: 1 });
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
        res.cookie("TrackIt", newToken, getCookieOptions());
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
      res.cookie("TrackIt", "", { maxAge: 1 });

      // Handle specific JWT errors
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

  // User logout
  logout: asyncHandler(async (req, res) => {
    res.cookie("TrackIt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1, // Expire immediately
    });

    return sendResponse(res, 200, "success", "Logged out successfully");
  }),

  // Forgot password (sending email token)
  forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, 400, "error", "Email is required");
    }

    try {
      // Convert email to lowercase
      const lowerCaseEmail = email.toLowerCase();

      // Find the user
      const user = await User.findOne({ email: lowerCaseEmail });
      if (!user) {
        // For security reasons, don't reveal if user exists or not
        return sendResponse(
          res,
          200,
          "success",
          `If a user with that email exists, a password reset link has been sent`
        );
      }

      // Use the method from the model
      const token = await user.generatePasswordResetToken();

      // Save the user
      await user.save();

      // Send the email
      await sendPasswordMail(user.email, token);

      return sendResponse(
        res,
        200,
        "success",
        `If a user with that email exists, a password reset link has been sent`
      );
    } catch (error) {
      // More specific error handling
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

  // Reset password
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

      // Find the user
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

      // Save the user
      await userFound.save();

      // Generate a new token and log the user in automatically
      const token = generateToken(userFound);
      res.cookie("TrackIt", token, getCookieOptions());

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

  // Delete a user (only user or admin)
  deleteUser: asyncHandler(async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return sendResponse(res, 400, "error", "User ID is required");
      }

      // Safely convert the authenticated user ID to a valid ObjectId string
      const currentUserId = safeObjectId(req.user.id);
      if (!currentUserId) {
        return sendResponse(res, 401, "error", "Invalid authentication");
      }

      // First, get the current authenticated user with complete details
      const currentUser = await User.findById(currentUserId);
      if (!currentUser) {
        return sendResponse(res, 401, "error", "Authentication failed");
      }

      // Ensure only the user themselves or an admin can delete
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

      // If user deletes their own account, log them out
      if (currentUser._id.toString() === userId) {
        res.cookie("TrackIt", "", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 1,
        });
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

  // Edit personal profile (only the user themselves or an admin)
  editUserProfile: asyncHandler(async (req, res) => {
    try {
      const { userId } = req.params;

      if (!userId) {
        return sendResponse(res, 400, "error", "User ID is required");
      }

      // First, check if the user exists
      const userToEdit = await User.findById(userId);
      if (!userToEdit) {
        return sendResponse(res, 404, "error", "User not found");
      }

      // Safely convert the authenticated user ID to a valid ObjectId string
      const currentUserId = safeObjectId(req.user.id);
      if (!currentUserId) {
        return sendResponse(res, 401, "error", "Invalid authentication");
      }

      // Get the complete details of the authenticated user
      const currentUser = await User.findById(currentUserId);
      if (!currentUser) {
        return sendResponse(res, 401, "error", "Authentication failed");
      }

      // Check authorization: Only the user themselves or an admin can edit
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

      // Validate input data
      const { firstname, lastname, email } = req.body;

      // Create an object with only the fields that should be updated
      const updateData = {};

      if (firstname) updateData.firstname = firstname;
      if (lastname) updateData.lastname = lastname;

      // Only allow email change if it's not already taken
      if (email && email !== userToEdit.email) {
        const lowerCaseEmail = email.toLowerCase();
        const emailExists = await User.findOne({
          email: lowerCaseEmail,
          _id: { $ne: userId },
        });
        if (emailExists) {
          return sendResponse(res, 400, "error", "Email is already in use");
        }
        updateData.email = lowerCaseEmail; // Use lowercase email
      }

      // Update the user
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

  // Admin-only edit user profile
  adminEditUser: asyncHandler(async (req, res) => {
    try {
      // Safely convert the authenticated user ID to a valid ObjectId string
      const currentUserId = safeObjectId(req.user.id);
      if (!currentUserId) {
        return sendResponse(res, 401, "error", "Invalid authentication");
      }

      // Get the complete details of the authenticated user
      const currentUser = await User.findById(currentUserId);
      if (!currentUser) {
        return sendResponse(res, 401, "error", "Authentication failed");
      }

      // Check if the current user is an admin
      if (currentUser.role !== "admin") {
        return sendResponse(res, 403, "error", "Unauthorized: Admins only");
      }

      const { userId } = req.params;

      if (!userId) {
        return sendResponse(res, 400, "error", "User ID is required");
      }

      // Check if user exists
      const userToEdit = await User.findById(userId);
      if (!userToEdit) {
        return sendResponse(res, 404, "error", "User not found");
      }

      // Validate and sanitize input data
      const { firstname, lastname, email, role } = req.body;

      // Create an object with only the fields that should be updated
      const updateData = {};

      if (firstname) updateData.firstname = firstname;
      if (lastname) updateData.lastname = lastname;

      // Only allow email change if it's not already taken
      if (email && email !== userToEdit.email) {
        const lowerCaseEmail = email.toLowerCase();
        const emailExists = await User.findOne({
          email: lowerCaseEmail,
          _id: { $ne: userId },
        });
        if (emailExists) {
          return sendResponse(res, 400, "error", "Email is already in use");
        }
        updateData.email = lowerCaseEmail; // Use lowercase email
      }

      // Only admins can change roles
      if (role) {
        // Validate role is one of the allowed values
        const allowedRoles = ["user", "admin", "manager"];
        if (!allowedRoles.includes(role)) {
          return sendResponse(res, 400, "error", "Invalid role specified");
        }

        // Prevent changing the role of the last admin
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

      // Update the user
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

  // Change password (for authenticated users)
  changePassword: asyncHandler(async (req, res) => {
    try {
      const { userId } = req.params;
      const { currentPassword, newPassword, confirmPassword } = req.body;

      // Validate input
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

      // Safely convert the authenticated user ID to a valid ObjectId string
      const currentUserId = safeObjectId(req.user.id);
      if (!currentUserId) {
        return sendResponse(res, 401, "error", "Invalid authentication");
      }

      // Get the complete details of the authenticated user
      const currentUser = await User.findById(currentUserId);
      if (!currentUser) {
        return sendResponse(res, 401, "error", "Authentication failed");
      }

      // Authorization check
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

      // Find the user
      const user = await User.findById(userId);
      if (!user) {
        return sendResponse(res, 404, "error", "User not found");
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return sendResponse(res, 400, "error", "Current password is incorrect");
      }

      // Hash and update password
      const salt = await bcrypt.genSalt(12);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      // Generate a new token with updated credentials
      const token = generateToken(user);
      res.cookie("TrackIt", token, getCookieOptions());

      return sendResponse(res, 200, "success", "Password changed successfully");
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
