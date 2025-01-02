import { Router } from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import reportController from "../controllers/reportController.js";

const reportRouter = Router();

reportRouter
  .post("/create", isAuthenticated, reportController.createReport)
  .get("/", reportController.fetchAllReports)
  .get("/:reportId", reportController.fetchOneReport)
  .patch("/:reportId", isAuthenticated, reportController.updateReport)
  .delete("/:reportId", isAuthenticated, reportController.deleteReport);

export default reportRouter;
