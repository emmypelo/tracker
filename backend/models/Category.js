import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    category: { type: String, required: [true, "Category title is required"] },
    description: { type: String },
    tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
const Category = model("Category", categorySchema);
export default Category;
