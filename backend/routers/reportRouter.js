import { Router } from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import reportController from "../controllers/reportController.js";

const reportRouter = Router();

reportRouter
  .post("/create", isAuthenticated, reportController.createReport)
  .get("/", reportController.fetchAllReports)
  .get("/:taskId", reportController.fetchOneReport)
  .patch("/:taskId", isAuthenticated, reportController.updateReport)
  .delete("/:taskId", isAuthenticated, reportController.deleteReport);

export default reportRouter;
