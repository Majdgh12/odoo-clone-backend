import Timesheet from "../models/timesheet.js";
import Task from "../models/Task.js";

// 🧮 Helper: Recalculate total spent hours for a task
async function updateTaskSpentHours(task_id) {
  if (!task_id) return;
  const total = await Timesheet.aggregate([
    { $match: { task_id } },
    { $group: { _id: null, total: { $sum: "$duration" } } },
  ]);
  await Task.findByIdAndUpdate(task_id, {
    spent_hours: total[0]?.total || 0,
  });
}

// 📄 Get all timesheets (optionally filter by project, task, or employee)
export const getTimesheets = async (req, res) => {
  try {
    const { project_id, task_id, employee_id } = req.query;
    const filter = {};
    if (project_id) filter.project_id = project_id;
    if (task_id) filter.task_id = task_id;
    if (employee_id) filter.employee_id = employee_id;

    const timesheets = await Timesheet.find(filter)
      .populate("employee_id", "full_name")
      .populate("project_id", "name")
      .populate("task_id", "title");

    res.json(timesheets);
  } catch (err) {
    res.status(500).json({ message: "Error fetching timesheets", error: err.message });
  }
};

// 🧱 Create new timesheet
export const createTimesheet = async (req, res) => {
  try {
    let data = req.body;

    // auto-calc duration if not provided
    if (!data.duration && data.start_time && data.end_time) {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      data.duration = (end - start) / (1000 * 60 * 60); // in hours
    }

    const timesheet = await Timesheet.create(data);

    // update task’s total spent hours if related
    if (timesheet.task_id) await updateTaskSpentHours(timesheet.task_id);

    res.status(201).json({
      message: "Timesheet created successfully",
      timesheet,
    });
  } catch (err) {
    res.status(400).json({ message: "Error creating timesheet", error: err.message });
  }
};

// 🔍 Get one timesheet
export const getTimesheetById = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id)
      .populate("employee_id", "full_name")
      .populate("project_id", "name")
      .populate("task_id", "title");

    if (!timesheet) return res.status(404).json({ message: "Timesheet not found" });

    res.json(timesheet);
  } catch (err) {
    res.status(500).json({ message: "Error fetching timesheet", error: err.message });
  }
};

// ✏️ Update timesheet
export const updateTimesheet = async (req, res) => {
  try {
    let data = req.body;

    // auto-calc duration if needed
    if (!data.duration && data.start_time && data.end_time) {
      const start = new Date(data.start_time);
      const end = new Date(data.end_time);
      data.duration = (end - start) / (1000 * 60 * 60);
    }

    const timesheet = await Timesheet.findByIdAndUpdate(req.params.id, data, {
      new: true,
    });

    if (!timesheet) return res.status(404).json({ message: "Timesheet not found" });

    // update related task spent hours
    if (timesheet.task_id) await updateTaskSpentHours(timesheet.task_id);

    res.json({
      message: "Timesheet updated successfully",
      timesheet,
    });
  } catch (err) {
    res.status(400).json({ message: "Error updating timesheet", error: err.message });
  }
};

// 🗑️ Delete timesheet
export const deleteTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findByIdAndDelete(req.params.id);

    if (!timesheet) return res.status(404).json({ message: "Timesheet not found" });

    // update task spent hours if linked
    if (timesheet.task_id) await updateTaskSpentHours(timesheet.task_id);

    res.json({ message: "Timesheet deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting timesheet", error: err.message });
  }
};

import Project from "../models/Project.js";
import mongoose from "mongoose";

// 🔍 Get all projects where this employee is assigned
export const getProjectsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    // ✅ Find all projects where the employee is a member
    const projects = await Project.find({ members: employeeId })
      .populate("department_id", "name")
      .populate("manager_id", "name email")
      .populate("team_lead_id", "name email")
      .select("name description status start_date end_date department_id manager_id team_lead_id")
      .lean();

    if (!projects.length) {
      return res.status(404).json({ message: "No projects found for this employee" });
    }

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Error fetching projects by employee:", error);
    res.status(500).json({ message: "Server error" });
  }
};
