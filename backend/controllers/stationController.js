import asyncHandler from "express-async-handler";
import { Station, Region } from "../models/ReportsModels.js";
import { sendResponse } from "../utilities/sendResponse.js";
import { findUser } from "../utilities/findUser.js";

const stationController = {
  // Create a new station
  createStation: asyncHandler(async (req, res) => {
    const { name, region, managerName, managerPhone } = req.body;

    const user = await findUser(req);

    if (!user) {
      return sendResponse(res, 400, "error", "Not a valid user");
    }

    try {
      const stationFound = await Station.findOne({ name });
      if (stationFound) {
        return sendResponse(res, 400, "error", "Station already exists");
      }

      const stationCreated = await Station.create({
        name,
        region,
        managerName,
        managerPhone,
        author: req.user._id,
      });

      // Update the Region model with the new station
      await Region.findByIdAndUpdate(
        region,
        { $push: { stations: stationCreated._id } },
        { new: true }
      );

      return sendResponse(res, 201, "success", "Station created successfully", {
        station: stationCreated,
      });
    } catch (error) {
      console.error("Error creating station:", error.message);
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

  // Fetch all stations
  fetchAllStations: asyncHandler(async (req, res) => {
    try {
      const stations = await Station.find().populate("region");
      return sendResponse(
        res,
        200,
        "success",
        "Stations fetched successfully",
        {
          stations,
        }
      );
    } catch (error) {
      console.error("Error fetching stations:", error.message);
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

  // Fetch a single station by ID
  fetchOneStation: asyncHandler(async (req, res) => {
    const { stationId } = req.params;

    try {
      const station = await Station.findById(stationId).populate("region");

      if (!station) {
        return sendResponse(res, 404, "error", "Station not found");
      }

      return sendResponse(res, 200, "success", "Station fetched successfully", {
        station,
      });
    } catch (error) {
      console.error("Error fetching station:", error.message);
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

  // Update a station
  updateStation: asyncHandler(async (req, res) => {
    const { stationId } = req.params;
    const { name, region, managerName, managerPhone } = req.body;

    try {
      const station = await Station.findById(stationId);
      if (!station) {
        return sendResponse(res, 404, "error", "Station not found");
      }

      // If the region is being changed, update both old and new regions
      if (station.region.toString() !== region) {
        // Remove station from old region
        await Region.findByIdAndUpdate(station.region, {
          $pull: { stations: stationId },
        });

        // Add station to new region
        await Region.findByIdAndUpdate(region, {
          $push: { stations: stationId },
        });
      }

      const updatedStation = await Station.findByIdAndUpdate(
        stationId,
        { name, region, managerName, managerPhone },
        { new: true }
      ).populate("region");

      return sendResponse(res, 200, "success", "Station updated successfully", {
        station: updatedStation,
      });
    } catch (error) {
      console.error("Error updating station:", error.message);
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

  // Delete a station
  deleteStation: asyncHandler(async (req, res) => {
    const { stationId } = req.params;

    try {
      const station = await Station.findById(stationId);
      if (!station) {
        return sendResponse(res, 404, "error", "Station not found");
      }

      // Remove the station from its region
      await Region.findByIdAndUpdate(station.region, {
        $pull: { stations: stationId },
      });

      await Station.findByIdAndDelete(stationId);
      return sendResponse(res, 200, "success", "Station deleted successfully");
    } catch (error) {
      console.error("Error deleting station:", error.message);
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

export default stationController;
