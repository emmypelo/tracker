import { Router } from "express";

import categoryController from "../controllers/categoryController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const categoryRouter = Router();
categoryRouter
  .post("/create", isAuthenticated, categoryController.createCategory)
  .get("/", categoryController.fetchAllCategories)
  .get("/:postId", categoryController.fetchOneCategory)
  .put("/posts/:postId", isAuthenticated, categoryController.updateCategory)
  .delete("/:postId", isAuthenticated, categoryController.deleteCategory);

export default categoryRouter;
