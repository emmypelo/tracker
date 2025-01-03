import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";

// Helper function for consistent API responses
const sendResponse = (
  res,
  statusCode,
  status,
  message,
  data = null,
  error = null
) => {
  const response = { status, message };
  if (data) response.data = data;
  if (error) response.error = error;

  return res.status(statusCode).json(response);
};

const categoryController = {
  // Create a new category
  createCategory: asyncHandler(async (req, res) => {
    const { category, description } = req.body;

    try {
      const categoryFound = await Category.findOne({ category });
      if (categoryFound) {
        return sendResponse(res, 400, "error", "Category already exists");
      }

      const categoryCreated = await Category.create({
        category,
        author: req.user,
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
      const categories = await Category.find();
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
      const category = await Category.findById(categoryId);

      if (!category) {
        return sendResponse(res, 404, "error", "Category not found");
      }

      return sendResponse(
        res,
        200,
        "success",
        "Category fetched successfully",
        {
          category,
        }
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
      const { categoryName, description } = req.body;

      const categoryFound = await Category.findById(categoryId);
      if (!categoryFound) {
        return sendResponse(res, 404, "error", "Category not found");
      }

      const categoryUpdated = await Category.findByIdAndUpdate(
        categoryId,
        { categoryName, description },
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

      const category = await Category.findById(categoryId);
      if (!category) {
        return sendResponse(res, 404, "error", "Category not found");
      }

      await Category.findByIdAndDelete(categoryId);
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

export default categoryController;
