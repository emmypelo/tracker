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
    // passmatch: {
    //   type: String,
    //   required: [true, "Password is required"],
    // },
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



// import mongoose from "mongoose";
// import crypto from "crypto";
// import bcrypt from "bcrypt";

// const { Schema, model } = mongoose;

// // Helper function for password reset token generation
// const generatePasswordResetToken = () => {
//   const emailToken = crypto.randomBytes(20).toString("hex");
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(emailToken)
//     .digest("hex");
//   const expires = new Date(Date.now() + 10 * 60 * 1000); // Token expires in 10 minutes
//   return { emailToken, hashedToken, expires };
// };

// // Define user schema
// const userSchema = new Schema(
//   {
//     firstname: {
//       type: String,
//       required: [true, "First name is required"],
//       trim: true,
//     },
//     lastname: {
//       type: String,
//       required: [true, "Last name is required"],
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: [true, "Email is required"],
//       unique: true,
//       lowercase: true,
//       trim: true,
//       validate: {
//         validator: function (v) {
//           return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
//         },
//         message: "Please enter a valid email",
//       },
//     },
//     isBlocked: {
//       type: Boolean,
//       default: false,
//     },
//     password: {
//       type: String,
//       required: [true, "Password is required"],
//       minlength: [8, "Password must be at least 8 characters long"],
//     },
//     role: {
//       type: String,
//       enum: ["user", "admin", "head"],
//       default: "user",
//     },
//     authMethod: {
//       type: String,
//       enum: ["google", "local", "facebook", "github"],
//       default: "local",
//       required: true,
//     },
//     passwordResetExpires: {
//       type: Date,
//       default: null,
//     },
//     passwordResetToken: {
//       type: String,
//       default: null,
//     },
//     tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
//   },
//   { timestamps: true }
// );

// // Pre-save hook to hash password
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   try {
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// // Instance method to generate a password reset token
// userSchema.methods.generatePasswordResetToken = function () {
//   const { emailToken, hashedToken, expires } = generatePasswordResetToken();
//   this.passwordResetToken = hashedToken;
//   this.passwordResetExpires = expires;
//   return emailToken;
// };

// // Instance method to compare password for authentication
// userSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password);
// };

// // Create and export the User model
// const User = model("User", userSchema);

// export default User;