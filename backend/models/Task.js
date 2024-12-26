import { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, trim: true },
    handler: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vendor: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount name is required"],
    },
    approver: {
      type: String,
      enum: ["TES", "AAB", "VAS", "TAA", "IOS"],
      required: [true, "Approver is required"],
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "category is required"],
    },
    subCategory: {
      type: Schema.Types.ObjectId,
      ref: "SubCategory",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    isOngoing: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      default: 0,
      min: [0, "Minimum value can not be lesser than 0"],
      max: [100, "Maximum value can not be greater than 100"],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    remark: {
      type: String,
      default: "No remark",
      trim: true,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to check progress before setting isCompleted
taskSchema.pre("save", function (next) {
  if (
    this.isModified("isCompleted") &&
    this.isCompleted &&
    this.progress < 90
  ) {
    this.isCompleted = false;
  }
  next();
});

const Task = model("Task", taskSchema);
export default Task;
