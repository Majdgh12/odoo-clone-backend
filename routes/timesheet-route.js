import express from "express";
import {
  createTimesheet,
  getTimesheets,
  getTimesheetById,
  updateTimesheet,
  deleteTimesheet,
} from "../controllers/timesheetController.js";

const router = express.Router();

/**
 * @route   POST /api/timesheets
 * @desc    Create a new timesheet entry
 * @access  Private (Employee or Manager)
 */
router.post("/", createTimesheet);

/**
 * @route   GET /api/timesheets
 * @desc    Get all timesheets (with optional filters)
 * @query   project_id, task_id, employee_id
 * @access  Private
 */
router.get("/", getTimesheets);

/**
 * @route   GET /api/timesheets/:id
 * @desc    Get a single timesheet by ID
 * @access  Private
 */
router.get("/:id", getTimesheetById);

/**
 * @route   PUT /api/timesheets/:id
 * @desc    Update a timesheet record
 * @access  Private
 */
router.put("/:id", updateTimesheet);

/**
 * @route   DELETE /api/timesheets/:id
 * @desc    Delete a timesheet record
 * @access  Private (Manager or Admin)
 */
router.delete("/:id", deleteTimesheet);

export default router;
