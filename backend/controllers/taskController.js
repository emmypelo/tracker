import asyncHandler from "express-async-handler";
import Category from "../models/Category.js";
import SubCategory from "../models/SubCategory.js";
import Task from "../models/Task.js";
import { sendResponse } from "../utilities/sendResponse.js";
import { findUser } from "../utilities/findUser.js";

const taskController = {
  // Create a new task
  createTask: asyncHandler(async (req, res) => {
    const { title, vendor, amount, approver, category, subCategory } = req.body;

    try {
      // Find category
      const categoryFound = await Category.findById(category);
      if (!categoryFound) {
        return sendResponse(res, 404, "error", "Category not found");
      }

      // Find subcategory
      const subCategoryFound = await SubCategory.findById(subCategory);
      if (!subCategoryFound) {
        return sendResponse(res, 404, "error", "Subcategory not found");
      }
      // Find User
      const userFound = await findUser(req);

      if (!userFound) {
        return sendResponse(res, 400, "error", "Not a valid user");
      }

      // Create new task
      const taskCreated = await Task.create({
        title,
        vendor,
        amount,
        approver,
        category,
        subCategory,
        handler: userFound._id,
      });

      // Push the task into the category's task array
      categoryFound.tasks.push(taskCreated._id);
      await categoryFound.save();

      // Push the task into the subcategory's task array
      subCategoryFound.tasks.push(taskCreated._id);
      await subCategoryFound.save();

      // Push the task into the user tasks array
      userFound.tasks.push(taskCreated._id);
      await userFound.save();

      return sendResponse(res, 201, "success", "Task created successfully", {
        task: taskCreated,
      });
    } catch (error) {
      console.error("Error creating task:", error);
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

  // Fetch all tasks
  fetchAllTasks: asyncHandler(async (req, res) => {
    const {
      category,
      subCategory,
      title,
      isApproved,
      isPaid,
      isCompleted,
      startDate,
      endDate,
    } = req.query;

    // Basic filter
    let filter = {};
    if (category) {
      filter.category = category;
    }
    if (subCategory) {
      filter.subCategory = subCategory;
    }
    if (title) {
      filter.title = { $regex: title, $options: "i" }; // case insensitive
    }
    if (isApproved) {
      filter.isApproved = isApproved;
    }
    if (isPaid) {
      filter.isPaid = isPaid;
    }
    if (isCompleted) {
      filter.isCompleted = isCompleted;
    }

    // Date filter
    if (startDate || endDate) {
      filter.updatedAt = {};
      if (startDate) {
        filter.updatedAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.updatedAt.$lte = new Date(endDate);
      }
    }

    try {
      // Fetch tasks based on the filter
      const tasks = await Task.find(filter)
        .populate("category")
        .populate("subCategory")
        .sort({ updatedAt: -1 });

      return sendResponse(res, 200, "success", "Tasks fetched successfully", {
        tasks,
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
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

  // Fetch one task by ID
  fetchOneTask: asyncHandler(async (req, res) => {
    try {
      const taskId = req.params.taskId;
      const task = await Task.findById(taskId)
        .populate("category")
        .populate("subCategory")
        .populate("handler");

      if (!task) {
        return sendResponse(res, 404, "error", "Task not found");
      }

      return sendResponse(res, 200, "success", "Task fetched successfully", {
        task,
      });
    } catch (error) {
      console.error("Error fetching task:", error);
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

  // Update an existing task
  updateTask: asyncHandler(async (req, res) => {
    try {
      const user = await findUser(req);

      // Find the task by ID
      const taskId = req.params.taskId;
      const taskFound = await Task.findById(taskId);
      if (!taskFound) {
        return sendResponse(res, 404, "error", "Task not found");
      }

      // Check user permission to update the task
      const canUpdate = user._id.toString() === taskFound.handler.toString();
      console.log(user._id, taskFound.handler);
      if (!canUpdate) {
        return sendResponse(
          res,
          403,
          "error",
          "You don't have permission to update this task"
        );
      }

      // Validate progress and isCompleted logic
      const { isCompleted, progress } = req.body;
      if (isCompleted && progress < 90) {
        return sendResponse(
          res,
          400,
          "error",
          "Task cannot be marked as completed if progress is less than 90%"
        );
      }

      // Safely update the task fields
      const updateFields = {};
      if (req.body.isApproved !== undefined)
        updateFields.isApproved = req.body.isApproved;
      if (req.body.isPaid !== undefined) updateFields.isPaid = req.body.isPaid;
      if (req.body.progress !== undefined)
        updateFields.progress = req.body.progress;
      if (req.body.isCompleted !== undefined)
        updateFields.isCompleted = req.body.isCompleted;
      if (req.body.remark !== undefined) updateFields.remark = req.body.remark;

      // Update the task
      const taskUpdated = await Task.findByIdAndUpdate(taskId, updateFields, {
        new: true, // Return the updated document
        runValidators: true, // Ensure Mongoose validation runs
      });

      return sendResponse(res, 200, "success", "Task updated successfully", {
        task: taskUpdated,
      });
    } catch (error) {
      console.error("Error updating task:", error);
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

  // Delete a task
  deleteTask: asyncHandler(async (req, res) => {
    try {
      const user = await findUser(req);

      // Find the task by ID
      const taskId = req.params.taskId;
      const taskFound = await Task.findById(taskId);
      if (!taskFound) {
        return sendResponse(res, 404, "error", "Task not found");
      }

      // Check user permission to update the task
      const canDelete = user._id.toString() === taskFound.handler.toString();
      console.log(user._id, taskFound.handler);
      if (!canDelete) {
        return sendResponse(
          res,
          403,
          "error",
          "You don't have permission to delete this task"
        );
      }

      await Task.findByIdAndDelete(taskId);
      return sendResponse(res, 200, "success", "Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
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

export default taskController;
