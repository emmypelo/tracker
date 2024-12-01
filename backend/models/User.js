import { Schema, model } from "mongoose";
import { randomBytes, createHash } from "crypto";

// Helper function for password reset token generation
const generatePasswordResetToken = () => {
  const emailToken = randomBytes(20).toString("hex");
  const hashedToken = createHash("sha256").update(emailToken).digest("hex");
  const expires = Date.now() + 10 * 60 * 1000; // Token expires in 10 minutes
  return { emailToken, hashedToken, expires };
};

// Define user schema
const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: [true, "First name is required"],
    },
    lastname: {
      type: String,
      required: [true, "Last name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    passmatch: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "head"],
      default: "user",
    },
    authMethod: {
      type: String,
      enum: ["google", "local", "facebook", "github"],
      default: "local",
      required: true,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  },
  { timestamps: true }
);

// Instance method to generate a password reset token
userSchema.methods.generatePasswordResetToken = function () {
  const { emailToken, hashedToken, expires } = generatePasswordResetToken();
  this.passwordResetToken = hashedToken;
  this.passwordResetExpires = expires;
  return emailToken;
};

// Create and export the User model
const User = model("User", userSchema);

export default User;
