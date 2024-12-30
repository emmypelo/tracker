import asyncHandler from "express-async-handler";
import { ReportCategory } from "../models/ReportsModels.js";
import { findUser } from "../utilities/findUser.js";
import { sendResponse } from "../utilities/sendResponse.js";

const reportCategoryController = {
  // Create a new category
  createCategory: asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    const user = await findUser(req);

    if (!user) {
      return sendResponse(res, 400, "error", "Not a valid user");
    }

    try {
      const categoryFound = await ReportCategory.findOne({ title });
      if (categoryFound) {
        return sendResponse(res, 400, "error", "category already exists");
      }

      const categoryCreated = await ReportCategory.create({
        title,
        author: user._id,
        description,
      });

      return sendResponse(
        res,
        201,
        "success",
        "Category created successfully",
        { category: categoryCreated }
      );
    } catch (error) {
      console.error("Error creating category:", error.message);
      return sendResponse(
        res,
        500,
        "error",
        "Internal Server Error",
        null,
        error.message
      );
    }
  }),

  // Fetch all categories
  fetchAllCategories: asyncHandler(async (req, res) => {
    try {
      const categories = await ReportCategory.find();
      return sendResponse(
        res,
        200,
        "success",
        "Categories fetched successfully",
        { categories }
      );
    } catch (error) {
      console.error("Error fetching categories:", error.message);
      return sendResponse(
        res,
        500,
        "error",
        "Internal Server Error",
        null,
        error.message
      );
    }
  }),

  // Fetch a single category by ID
  fetchOneCategory: asyncHandler(async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      const category = await ReportCategory.findById(categoryId);

      if (!category) {
        return sendResponse(res, 404, "error", "Category not found");
      }

      return sendResponse(
        res,
        200,
        "success",
        "Category fetched successfully",
        { category }
      );
    } catch (error) {
      console.error("Error fetching category:", error.message);
      return sendResponse(
        res,
        500,
        "error",
        "Internal Server Error",
        null,
        error.message
      );
    }
  }),

  // Update a category
  updateCategory: asyncHandler(async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      const { title, description } = req.body;

      const categoryFound = await ReportCategory.findById(categoryId);
      if (!categoryFound) {
        return sendResponse(res, 404, "error", "Category not found");
      }

      const categoryUpdated = await ReportCategory.findByIdAndUpdate(
        categoryId,
        { title, description },
        { new: true }
      );

      return sendResponse(
        res,
        200,
        "success",
        "Category updated successfully",
        { category: categoryUpdated }
      );
    } catch (error) {
      console.error("Error updating category:", error.message);
      return sendResponse(
        res,
        500,
        "error",
        "Internal Server Error",
        null,
        error.message
      );
    }
  }),

  // Delete a category
  deleteCategory: asyncHandler(async (req, res) => {
    try {
      const categoryId = req.params.categoryId;

      const category = await ReportCategory.findById(categoryId);
      if (!category) {
        return sendResponse(res, 404, "error", "Category not found");
      }

      await ReportCategory.findByIdAndDelete(categoryId);
      return sendResponse(res, 200, "success", "Category deleted successfully");
    } catch (error) {
      console.error("Error deleting category:", error.message);
      return sendResponse(
        res,
        500,
        "error",
        "Internal Server Error",
        null,
        error.message
      );
    }
  }),
};

export default reportCategoryController;
