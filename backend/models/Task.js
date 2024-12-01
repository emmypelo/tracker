import { Schema, model } from "mongoose";

const taskSchema = new Schema(
  {
    title: { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, trim: true },
    handler: {
      type: Schema.Types.ObjectId,
      ref: "User",
      // required: true,
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
      required: [true, 'category is required'],
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

    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const Task = model("Task", taskSchema);
export default Task;
