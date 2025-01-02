import asyncHandler from "express-async-handler";
import SubCategory from "../models/SubCategory.js";
import { sendResponse } from "../utilities/sendResponse.js";
import { findUser } from "../utilities/findUser.js";

const subCategoryController = {
  // Create a new subcategory
  createSubCategory: asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const user = await findUser(req);

    if (!user) {
      return sendResponse(res, 400, "error", "Not a valid user");
    }
    try {
      const subCategoryFound = await SubCategory.findOne({ title });
      if (subCategoryFound) {
        return sendResponse(res, 400, "error", "Subcategory already exists");
      }

      const subCategoryCreated = await SubCategory.create({
        title,
        author: user._id,
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
