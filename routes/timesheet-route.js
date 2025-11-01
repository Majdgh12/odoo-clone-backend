import express from "express";
import {
  getTimesheets,
  getTimesheetById,
  createTimesheet,
  updateTimesheet,
  deleteTimesheet,
  getTimesheetsGrouped,
  getTimesheetsByRole,
  getProjectsByRole,
  deleteTimesheetsBySelection,
} from "../controllers/timesheetController.js";

const router = express.Router();

/**
 * @route   GET /api/timesheets
 * @desc    Get all timesheets (filter by project, task, employee, or day/week/month)
 */
router.get("/", getTimesheets);
router.get("/grouped", getTimesheetsGrouped);

/**
 * @route   GET /api/timesheets/:id
 * @desc    Get single timesheet
 */
router.get("/:id", getTimesheetById);

/**
 * @route   POST /api/timesheets
 * @desc    Create new timesheet
 */
router.post("/", createTimesheet);

/**
 * @route   PUT /api/timesheets/:id
 * @desc    Update timesheet
 */
router.put("/:id", updateTimesheet);

/**
 * @route   DELETE /api/timesheets/:id
 * @desc    Delete timesheet
 */
router.delete("/:id", deleteTimesheet);
router.delete("/delete/by-selection", deleteTimesheetsBySelection);


// routes/timesheet-route.js
router.get("/all/role", getTimesheetsByRole);
router.get("/projects/by-role", getProjectsByRole); // 👈 new route


export default router;
