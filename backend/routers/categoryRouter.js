import { Router } from "express";

import categoryController from "../controllers/categoryController.js";
import {isAuthenticated} from "../middlewares/isAuthenticated.js";

const categoryRouter = Router();
categoryRouter
  .post("/create", isAuthenticated, categoryController.createCategory)
  .get("/", categoryController.fetchAllCategories)
  .get("/:categoryId", categoryController.fetchOneCategory)
  .put("/:categoryId", isAuthenticated, categoryController.updateCategory)
  .delete("/:categoryId", isAuthenticated, categoryController.deleteCategory);

export default categoryRouter;
