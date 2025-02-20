import { Router } from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import reportCategoryController from "../controllers/reportCategoryController.js";

const reportCategoryRouter = Router();
reportCategoryRouter
  .post("/create", isAuthenticated, reportCategoryController.createCategory)
  .get("/", reportCategoryController.fetchAllCategories)
  .get("/:regionId", reportCategoryController.fetchOneCategory)
  .put("/:regionId", isAuthenticated, reportCategoryController.updateCategory)
  .delete(
    "/:regionId",
    isAuthenticated,
    reportCategoryController.deleteCategory
  );

export default reportCategoryRouter;
