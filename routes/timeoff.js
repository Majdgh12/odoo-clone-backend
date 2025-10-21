import express from "express";
import * as Request from "../controllers/timeoffRequest-controller.js";

import {
  approveRequest,
  rejectRequest
} from "../controllers/approval-controller.js";

import {
  getBalance,
  updateBalance
} from "../controllers/timeoffBalance-controller.js";

import {
  addHoliday,
  getHolidays,
  deleteHoliday
} from "../controllers/publicholiday-controller.js";
import mongoose from "mongoose";
const router = express.Router();

console.log("TimeOff routes loaded");

// Create a new time off request (Employee or Manager)
router.post("/requests", Request.createTimeOffRequest);

// Get all requests (Admin/Manager)
router.get("/requests", Request.getAllTimeOffRequests);

// Get requests by employee
router.get("/requests/employee/:employeeId", Request.getRequestsByEmployee);

// Delete pending request (Employee)
router.delete("/requests/:id", Request.deleteRequest);


// Approve a request (Manager or Admin)
router.put("/requests/:id/approve", approveRequest);

// Reject a request (Manager or Admin)
router.put("/requests/:id/reject", rejectRequest);


// Get employee balance
router.get("/balance/:employeeId", getBalance);

// Update balance (Admin only)
router.put("/balance/:employeeId", updateBalance);

// Add holiday (Admin only)
router.post("/holidays", addHoliday);

// Get all holidays
router.get("/holidays", getHolidays);

// Delete holiday (Admin only)
router.delete("/holidays/:id", deleteHoliday);
router.get("/requests/department/:managerId", Request.getDepartmentRequests);

export default router;
