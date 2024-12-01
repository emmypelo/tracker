import { Router } from "express";
import subCategoryController from "../controllers/subCategoryController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const subCategoryRouter = Router();

subCategoryRouter
  .post("/create", isAuthenticated, subCategoryController.createSubCategory) // Create a subcategory
  .get("/", isAuthenticated, subCategoryController.fetchAllSubCategories) // Fetch all subcategories
  .get("/:subCategoryId", subCategoryController.fetchOneSubCategory) // Fetch a single subcategory by ID
  .put(
    "/:subCategoryId",
    isAuthenticated,
    subCategoryController.updateSubCategory
  ) // Update a subcategory by ID
  .delete(
    "/:subCategoryId",
    isAuthenticated,
    subCategoryController.deleteSubCategory
  ); // Delete a subcategory by ID

export default subCategoryRouter;
