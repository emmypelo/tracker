import asyncHandler from "express-async-handler";
import { Region } from "../models/ReportsModels.js";
import { sendResponse } from "../utilities/sendResponse.js";
import { findUser } from "../utilities/findUser.js";

const regionController = {
  // Create a new region
  createRegion: asyncHandler(async (req, res) => {
    const { title, rss, supervisor } = req.body;

    const user = await findUser(req);

    if (!user) {
      return sendResponse(res, 400, "error", "Not a valid user");
    }

    try {
      const regionFound = await Region.findOne({ title });
      if (regionFound) {
        return sendResponse(res, 400, "error", "Region already exists");
      }

      const regionCreated = await Region.create({
        title,
        rss,
        supervisor,
        author: req.user._id,
      });

      return sendResponse(res, 201, "success", "Region created successfully", {
        region: regionCreated,
      });
    } catch (error) {
      console.error("Error creating region:", error.message);
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

  // Fetch all regions
  fetchAllRegions: asyncHandler(async (req, res) => {
    try {
      const regions = await Region.find()
        .populate("stations")
        .populate("reports");
      return sendResponse(res, 200, "success", "Regions fetched successfully", {
        regions,
      });
    } catch (error) {
      console.error("Error fetching regions:", error.message);
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

  // Fetch a single region by ID
  fetchOneRegion: asyncHandler(async (req, res) => {
    const { regionId } = req.params;

    try {
      const region = await Region.findById(regionId);

      if (!region) {
        return sendResponse(res, 404, "error", "Region not found");
      }

      return sendResponse(res, 200, "success", "Region fetched successfully", {
        region,
      });
    } catch (error) {
      console.error("Error fetching region:", error.message);
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

  // Update a region
  updateRegion: asyncHandler(async (req, res) => {
    const { regionId } = req.params;
    const { title, rss, supervisor } = req.body;

    try {
      const region = await Region.findById(regionId);
      if (!region) {
        return sendResponse(res, 404, "error", "Region not found");
      }

      const updatedRegion = await Region.findByIdAndUpdate(
        regionId,
        { title, rss, supervisor },
        { new: true }
      );

      return sendResponse(res, 200, "success", "Region updated successfully", {
        region: updatedRegion,
      });
    } catch (error) {
      console.error("Error updating region:", error.message);
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

  // Delete a region
  deleteRegion: asyncHandler(async (req, res) => {
    const { regionId } = req.params;

    try {
      const region = await Region.findById(regionId);
      if (!region) {
        return sendResponse(res, 404, "error", "Region not found");
      }

      await Region.findByIdAndDelete(regionId);
      return sendResponse(res, 200, "success", "Region deleted successfully");
    } catch (error) {
      console.error("Error deleting region:", error.message);
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

export default regionController;
