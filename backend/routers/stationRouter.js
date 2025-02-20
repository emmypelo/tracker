import { Router } from "express";

import isAuthenticated from "../middlewares/isAuthenticated.js";
import stationController from "../controllers/stationController.js";

const stationRouter = Router();
stationRouter
  .post("/create", isAuthenticated, stationController.createStation)
  .get("/", stationController.fetchAllStations)
  .get("/:stationId", stationController.fetchOneStation)
  .put("/:stationId", isAuthenticated, stationController.updateStation)
  .delete("/:stationId", isAuthenticated, stationController.deleteStation);

export default stationRouter;
