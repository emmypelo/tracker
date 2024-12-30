import asyncHandler from "express-async-handler";
import {
  Report,
  ReportCategory,
  Region,
  Station,
} from "../models/ReportsModels.js";

import { sendResponse } from "../utilities/sendResponse.js";
import { findUser } from "../utilities/findUser.js";

const reportController = {
  // Create a new report
  createReport: asyncHandler(async (req, res) => {
    const {
      title,
      region,
      reportCategory,
      description,
      status,
      station,
      comment,
    } = req.body;

    try {
      // Find region
      const regionFound = await Region.findById(region);
      if (!regionFound) {
        return sendResponse(res, 404, "error", "Region not found");
      }

      // Find report category
      const reportCategoryFound = await ReportCategory.findById(reportCategory);
      if (!reportCategoryFound) {
        return sendResponse(res, 404, "error", "Report category not found");
      }

      // Find station
      const stationFound = await Station.findById(station);
      if (!stationFound) {
        return sendResponse(res, 404, "error", "Station not found");
      }

      // Find User
      const userFound = await findUser(req);
      if (!userFound) {
        return sendResponse(res, 400, "error", "Not a valid user");
      }

      // Create new report
      const reportCreated = await Report.create({
        title,
        region,
        reportCategory,
        description,
        status,
        station: [station],
        comment,
      });

      // Add the report to the station
      stationFound.reports.push(reportCreated._id);
      await stationFound.save();

      return sendResponse(res, 201, "success", "Report created successfully", {
        report: reportCreated,
      });
    } catch (error) {
      console.error("Error creating report:", error);
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

  // Fetch all reports
  fetchAllReports: asyncHandler(async (req, res) => {
    const { region, reportCategory, title, status, startDate, endDate } =
      req.query;

    // Basic filter
    let filter = {};
    if (region) {
      filter.region = region;
    }
    if (reportCategory) {
      filter.reportCategory = reportCategory;
    }
    if (title) {
      filter.title = { $regex: title, $options: "i" }; // case insensitive
    }
    if (status) {
      filter.status = status;
    }

    // Date filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    try {
      // Fetch reports based on the filter
      const reports = await Report.find(filter)
        .populate("region")
        .populate("reportCategory")
        .populate("station")
        .sort({ createdAt: -1 });

      return sendResponse(res, 200, "success", "Reports fetched successfully", {
        reports,
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
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

  // Fetch one report by ID
  fetchOneReport: asyncHandler(async (req, res) => {
    try {
      const reportId = req.params.reportId;
      const report = await Report.findById(reportId)
        .populate("region")
        .populate("reportCategory")
        .populate("station");

      if (!report) {
        return sendResponse(res, 404, "error", "Report not found");
      }

      return sendResponse(res, 200, "success", "Report fetched successfully", {
        report,
      });
    } catch (error) {
      console.error("Error fetching report:", error);
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

  // Update an existing report
  updateReport: asyncHandler(async (req, res) => {
    try {
      const user = await findUser(req);

      // Find the report by ID
      const reportId = req.params.reportId;
      const reportFound = await Report.findById(reportId);
      if (!reportFound) {
        return sendResponse(res, 404, "error", "Report not found");
      }

      // Check user permission to update the report
      // You might want to implement your own permission logic here
      const canUpdate = true; // Placeholder for permission check

      if (!canUpdate) {
        return sendResponse(
          res,
          403,
          "error",
          "You don't have permission to update this report"
        );
      }

      // Update the report fields
      const {
        title,
        region,
        reportCategory,
        description,
        status,
        station,
        comment,
      } = req.body;
      const updateFields = {
        title,
        region,
        reportCategory,
        description,
        status,
        station,
        comment,
      };

      // Update the report
      const reportUpdated = await Report.findByIdAndUpdate(
        reportId,
        updateFields,
        {
          new: true,
          runValidators: true,
        }
      );

      return sendResponse(res, 200, "success", "Report updated successfully", {
        report: reportUpdated,
      });
    } catch (error) {
      console.error("Error updating report:", error);
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

  // Delete a report
  deleteReport: asyncHandler(async (req, res) => {
    try {
      const user = await findUser(req);

      // Find the report by ID
      const reportId = req.params.reportId;
      const reportFound = await Report.findById(reportId);
      if (!reportFound) {
        return sendResponse(res, 404, "error", "Report not found");
      }

      // Check user permission to delete the report
      // You might want to implement your own permission logic here
      const canDelete = true; // Placeholder for permission check

      if (!canDelete) {
        return sendResponse(
          res,
          403,
          "error",
          "You don't have permission to delete this report"
        );
      }

      // Remove the report reference from the associated station
      await Station.updateMany(
        { _id: { $in: reportFound.station } },
        { $pull: { reports: reportId } }
      );

      // Delete the report
      await Report.findByIdAndDelete(reportId);

      return sendResponse(res, 200, "success", "Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
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

export default reportController;
