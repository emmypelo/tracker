import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import passport from "passport";
import crypto from "crypto";
import User from "../models/User.js";
import sendPasswordMail from "../utilities/sendPasswordMail.js";
import { sendResponse } from "../utilities/sendResponse.js";

const userController = {
  // Check if user exists
  checkUserExist: asyncHandler(async (req, res) => {
    const { email } = req.body;
    try {
      const userExist = await User.findOne({ email });
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

    // Ensure passwords match
    if (password !== passmatch) {
      return sendResponse(res, 400, "error", "Passwords don't match");
    }

    try {
      // Check if user already exists
      const userExist = await User.findOne({ email });
      if (userExist) {
        return sendResponse(res, 400, "error", "User already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
      });

      return sendResponse(res, 201, "success", "User created successfully", {
        user: newUser,
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

  // User login
  loginUser: asyncHandler(async (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        return sendResponse(res, 401, "error", info.message);
      }

      // Generate JWT token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });

      // Set token in cookie
      res.cookie("TrackIt", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Only set to true in production
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      });

      return sendResponse(res, 200, "success", "Login Success", {
        isAuthenticated: true,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        _id: user._id,
      });
    })(req, res, next);
  }),

  // Check authentication status
  checkAuthentication: asyncHandler(async (req, res) => {
    const token = req.cookies["TrackIt"];
    if (!token) {
      return sendResponse(res, 401, "error", "User is not authenticated", {
        isAuthenticated: false,
      });
    }

    try {
      const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decodedUser.id);
      if (!user) {
        return sendResponse(res, 401, "error", "User not found", {
          isAuthenticated: false,
        });
      }

      return sendResponse(res, 200, "success", "User is authenticated", {
        isAuthenticated: true,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        _id: user._id,
      });
    } catch (error) {
      return sendResponse(
        res,
        401,
        "error",
        "Authentication failed",
        null,
        error.message
      );
    }
  }),

  // User logout
  logout: asyncHandler(async (req, res) => {
    res.cookie("TrackIt", "", { maxAge: 1 }); // Expire cookie immediately
    return sendResponse(res, 200, "success", "Logged out successfully");
  }),

  //! forgot password (sending email token)
  forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;

    try {
      // find the user
      const user = await User.findOne({ email });
      if (!user) {
        return sendResponse(
          res,
          404,
          "error",
          `User with email ${email} is not found `
        );
      }

      //use the method from the model
      const token = await user.generatePasswordResetToken();
      //resave the user
      await user.save();
      //send the email
      await sendPasswordMail(user.email, token);

      return sendResponse(
        res,
        200,
        "success",
        `Password reset email sent to ${email}`
      );
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
  //! reset password
  resetPassword: asyncHandler(async (req, res) => {
    const { verifyToken } = req.params;
    const { password } = req.body;

    try {
      //Convert the token to actual token that has been saved in our db
      const cryptoToken = crypto
        .createHash("sha256")
        .update(verifyToken)
        .digest("hex");

      //Find the user
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

      //Update the user field
      //change the password
      const salt = await bcrypt.genSalt(10);
      userFound.password = await bcrypt.hash(password, salt);
      userFound.passwordResetToken = null;
      userFound.passwordResetExpires = null;

      //resave the user
      await userFound.save();

      return sendResponse(res, 200, "success", "Password successfully reset");
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
