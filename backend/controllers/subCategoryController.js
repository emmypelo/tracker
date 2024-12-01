import asyncHandler from "express-async-handler";
import SubCategory from "../models/SubCategory.js";

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

const subCategoryController = {
  // Create a new subcategory
  createSubCategory: asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    try {
      const subCategoryFound = await SubCategory.findOne({ title });
      if (subCategoryFound) {
        return sendResponse(res, 400, "error", "Subcategory already exists");
      }

      const subCategoryCreated = await SubCategory.create({
        title,
        author: req.user,
        description,
      });

      return sendResponse(
        res,
        201,
        "success",
        "Subcategory created successfully",
        { subCategory: subCategoryCreated }
      );
    } catch (error) {
      console.error("Error creating subcategory:", error.message);
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

  // Fetch all subcategories
  fetchAllSubCategories: asyncHandler(async (req, res) => {
    try {
      const subCategories = await SubCategory.find();
      return sendResponse(
        res,
        200,
        "success",
        "Subcategories fetched successfully",
        { subCategories }
      );
    } catch (error) {
      console.error("Error fetching subcategories:", error.message);
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

  // Fetch a single subcategory by ID
  fetchOneSubCategory: asyncHandler(async (req, res) => {
    try {
      const subCategoryId = req.params.subCategoryId;
      const subCategory = await SubCategory.findById(subCategoryId);

      if (!subCategory) {
        return sendResponse(res, 404, "error", "Subcategory not found");
      }

      return sendResponse(
        res,
        200,
        "success",
        "Subcategory fetched successfully",
        { subCategory }
      );
    } catch (error) {
      console.error("Error fetching subcategory:", error.message);
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

  // Update a subcategory
  updateSubCategory: asyncHandler(async (req, res) => {
    try {
      const subCategoryId = req.params.subCategoryId;
      const { title, description } = req.body;

      const subCategoryFound = await SubCategory.findById(subCategoryId);
      if (!subCategoryFound) {
        return sendResponse(res, 404, "error", "Subcategory not found");
      }

      const subCategoryUpdated = await SubCategory.findByIdAndUpdate(
        subCategoryId,
        { title, description },
        { new: true }
      );

      return sendResponse(
        res,
        200,
        "success",
        "Subcategory updated successfully",
        { subCategory: subCategoryUpdated }
      );
    } catch (error) {
      console.error("Error updating subcategory:", error.message);
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

  // Delete a subcategory
  deleteSubCategory: asyncHandler(async (req, res) => {
    try {
      const subCategoryId = req.params.subCategoryId;

      const subCategory = await SubCategory.findById(subCategoryId);
      if (!subCategory) {
        return sendResponse(res, 404, "error", "Subcategory not found");
      }

      await SubCategory.findByIdAndDelete(subCategoryId);
      return sendResponse(
        res,
        200,
        "success",
        "Subcategory deleted successfully"
      );
    } catch (error) {
      console.error("Error deleting subcategory:", error.message);
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

export default subCategoryController;
