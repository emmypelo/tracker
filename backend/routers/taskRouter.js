import { Router } from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import taskController from "../controllers/taskController.js";

const taskRouter = Router();

taskRouter
  .post("/create", isAuthenticated, taskController.createTask)
  .get("/", taskController.fetchAllTasks)
  .get("/:taskId", taskController.fetchOneTask)
  .patch("/:taskId", isAuthenticated, taskController.updateTask)
  .delete("/:taskId", isAuthenticated, taskController.deleteTask);

export default taskRouter;
