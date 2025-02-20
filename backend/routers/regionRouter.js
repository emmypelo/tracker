import { Router } from "express";

import regionController from "../controllers/regionController.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";

const regionRouter = Router();
regionRouter
  .post("/create", isAuthenticated, regionController.createRegion)
  .get("/", regionController.fetchAllRegions)
  .get("/:regionId", regionController.fetchOneRegion)
  .put("/:regionId", isAuthenticated, regionController.updateRegion)
  .delete("/:regionId", isAuthenticated, regionController.deleteRegion);

export default regionRouter;
