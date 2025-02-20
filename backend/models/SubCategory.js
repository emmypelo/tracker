import { Schema, model } from "mongoose";

const subCategorySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Sub-category title is required"],
    },
    description: { type: String },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
const SubCategory = model("SubCategory", subCategorySchema);
export default SubCategory;
