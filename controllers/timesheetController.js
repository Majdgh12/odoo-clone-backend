import mongoose from "mongoose";
import Timesheet from "../models/timesheet.js";
import Employee from "../models/Employee.js";
import Project from "../models/Project.js";
import { format,isValid,startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

/**
 * 🧠 Helper: Update project total logged time
 * (optional, replaces updateTaskSpentHours)
 */
async function updateProjectSpentHours(project_id) {
  if (!project_id) return;

  const total = await Timesheet.aggregate([
    { $match: { project_id: new mongoose.Types.ObjectId(project_id) } },
    { $group: { _id: null, total: { $sum: "$duration" } } },
  ]);

  await Project.findByIdAndUpdate(project_id, {
    total_logged_hours: total[0]?.total || 0,
  });
}
/**
 * 📄 GET /api/timesheets
 * Fetch all timesheets (filtered by project, employee, or period)
 */
export const getTimesheets = async (req, res) => {
  try {
    const { project_id, employee_id, period } = req.query;
    const filter = {};

    if (project_id) filter.project_id = project_id;
    if (employee_id) filter.employee_id = employee_id;

    const now = new Date();
    if (period === "day") {
      filter.date = { $gte: startOfDay(now), $lte: endOfDay(now) };
    } else if (period === "week") {
      filter.date = { $gte: startOfWeek(now), $lte: endOfWeek(now) };
    } else if (period === "month") {
      filter.date = { $gte: startOfMonth(now), $lte: endOfMonth(now) };
    }

    const timesheets = await Timesheet.find(filter)
      .populate("employee_id", "full_name")
      .populate("project_id", "name")
      .populate("task_id", "title") 
      .sort({ date: -1 });

    res.status(200).json(timesheets);
  } catch (error) {
    console.error("❌ Error fetching timesheets:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * 🧱 POST /api/timesheets
 * Create a new timesheet
 */
export const createTimesheet = async (req, res) => {
  try {
    const { employee_id, project_id, task_id, date, duration, description } = req.body;

    if (!employee_id || !date || duration == null) {
      return res.status(400).json({
        success: false,
        message: "Employee, date, and duration are required",
      });
    }

    // 🧠 Fetch related names for caching
    let projectName = null;
    let taskTitle = null;

    if (project_id && mongoose.Types.ObjectId.isValid(project_id)) {
      const project = await Project.findById(project_id).select("name");
      projectName = project?.name || null;
    }

    if (task_id && mongoose.Types.ObjectId.isValid(task_id)) {
      const task = await mongoose.model("Task").findById(task_id).select("title name");
      taskTitle = task?.title || task?.name || null;
    }

    // 🧱 Create new timesheet with cached names
    const newTimesheet = await Timesheet.create({
      employee_id,
      project_id: project_id || null,
      project: projectName, // ✅ cache project name
      task_id: task_id || null,
      task: taskTitle, // ✅ cache task title
      date,
      duration,
      description: description || "",
    });

    res.status(201).json({ success: true, data: newTimesheet });
  } catch (error) {
    console.error("❌ createTimesheet error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


/**
 * 🔍 GET /api/timesheets/:id
 */
export const getTimesheetById = async (req, res) => {
  try {
    const timesheet = await Timesheet.findById(req.params.id)
      .populate("employee_id", "full_name")
      .populate("project_id", "name");

    if (!timesheet) {
      return res.status(404).json({ message: "Timesheet not found" });
    }

    res.status(200).json(timesheet);
  } catch (error) {
    res.status(500).json({ message: "Error fetching timesheet", error: error.message });
  }
};

/**
 * ✏️ PUT /api/timesheets/:id
 */

export const updateTimesheet = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const timesheet = await Timesheet.findById(id);
    if (!timesheet)
      return res.status(404).json({ success: false, message: "Timesheet not found" });

    // 🧠 Initialize meta safely
    timesheet.meta = timesheet.meta || {};
    timesheet.meta.entries = timesheet.meta.entries || {};

    // 🕒 Only process if date + duration provided
    if (data.date && data.duration != null) {
      const dateObj = new Date(data.date);
      const dayKey = format(dateObj, "EEE");

      const prev = Number(timesheet.meta.entries[dayKey]) || 0;
      const added = Number(data.duration);

      // ✅ Add to existing day instead of overwriting
      timesheet.meta.entries[dayKey] = prev + added;

      // ✅ Recalculate total across all days
      const total = Object.values(timesheet.meta.entries).reduce(
        (sum, val) => sum + (Number(val) || 0),
        0
      );
      timesheet.duration = total;
    }

    // ✅ Update only safe fields (don't override meta or duration)
    if (data.description) timesheet.description = data.description;
    if (data.task_id) timesheet.task_id = data.task_id;
    if (data.project_id) timesheet.project_id = data.project_id;
    if (data.project_id && mongoose.Types.ObjectId.isValid(data.project_id)) {
  const proj = await Project.findById(data.project_id).select("name");
  timesheet.project = proj?.name || timesheet.project;
}

if (data.task_id && mongoose.Types.ObjectId.isValid(data.task_id)) {
  const task = await mongoose.model("Task").findById(data.task_id).select("title name");
  timesheet.task = task?.title || task?.name || timesheet.task;
}

    await timesheet.save();

    // (optional) Update project totals
    if (timesheet.project_id) await updateProjectSpentHours(timesheet.project_id);

    res.status(200).json({
      success: true,
      message: "Timesheet updated successfully",
      data: timesheet,
    });
  } catch (error) {
    console.error("❌ updateTimesheet error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating timesheet",
      error: error.message,
    });
  }
};



/**
 * 🗑️ DELETE /api/timesheets/:id
 */
export const deleteTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findByIdAndDelete(req.params.id);
    if (!timesheet) return res.status(404).json({ message: "Timesheet not found" });

    if (timesheet.project_id) await updateProjectSpentHours(timesheet.project_id);

    res.status(200).json({ message: "Timesheet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting timesheet", error: error.message });
  }
};

/**
 * 📁 GET /api/timesheets/projects/:employeeId
 * Fetch all projects that this employee is assigned to
 */
export const getProjectsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const projects = await Project.find({ members: employeeId })
      .populate("department_id", "name")
      .populate("manager_id", "name email")
      .populate("team_lead_id", "name email")
      .select("name description status start_date end_date department_id manager_id team_lead_id")
      .lean();

    if (!projects.length) {
      return res.status(404).json({ message: "No projects found for this employee" });
    }

    res.status(200).json({ success: true, count: projects.length, projects });
  } catch (error) {
    console.error("Error fetching projects by employee:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// controllers/timesheet-controller.js
// 📘 Get grouped timesheets by project and weekday
export const getTimesheetsGrouped = async (req, res) => {
  try {
    const view = req.query.view || "week";
    const employeeId = req.query.employee_id;
    const role = req.query.role || "employee";
    const departmentId = req.query.department_id;

    const now = req.query.date ? new Date(req.query.date) : new Date();
    let start, end;

    if (view === "day") {
      start = startOfDay(now);
      end = endOfDay(now);
    } else if (view === "month") {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
    }

    const filter = { date: { $gte: start, $lte: end } };
    if (role === "employee" && employeeId) {
      filter.employee_id = employeeId;
    } else if (role === "manager" && departmentId) {
      filter.department_id = departmentId;
    }

    const timesheets = await Timesheet.find(filter)
      .populate("project_id", "name")
      .populate("employee_id", "full_name")
      .populate("task_id", "title name");

    const grouped = {};

    for (const t of timesheets) {
      const projectName =
        t.project_id?.name ||
        t.project ||
        (typeof t.project_id === "string" ? t.project_id : null) ||
        "No Project";

      const taskName =
        t.task_id?.title ||
        t.task_id?.name ||
        t.task ||
        (typeof t.task_id === "string" ? t.task_id : null);

      const projectTaskLabel = taskName ? `${projectName} / ${taskName}` : projectName;

      if (!grouped[projectTaskLabel]) {
        grouped[projectTaskLabel] = {
          _id: t._id,
          project_id: t.project_id?._id || null,
          project_name: projectName,
          task_id: t.task_id?._id || null,
          task_title: taskName,
          employee: t.employee_id?.full_name || "-",
          entries: {},
          total: 0,
        };
      }

      // ✅ Use full ISO date for month view keys (matches frontend)
      const d = new Date(t.date);
      const key =
        view === "month"
          ? d.toISOString().slice(0, 10) // "2025-10-30"
          : d.toLocaleDateString("en-US", { weekday: "short" });

      if (!grouped[projectTaskLabel].entries[key]) {
        grouped[projectTaskLabel].entries[key] = 0;
      }

      grouped[projectTaskLabel].entries[key] += t.duration || 0;
      grouped[projectTaskLabel].total += t.duration || 0;
    }

    console.log("✅ Grouped timesheets:", Object.values(grouped).length);

    res.status(200).json({
      success: true,
      view,
      data: Object.values(grouped),
    });
  } catch (error) {
    console.error("❌ getTimesheetsGrouped error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while grouping timesheets",
      error: error.message,
    });
  }
};



export const getTimesheetsByRole = async (req, res) => {
  try {
    const { role, employee_id, department_id } = req.query;

    let filter = {};

    if (role === "admin") {
      // Admin → sees everything
      filter = {};
    } 
    else if ((role === "manager" || role === "team_lead") && department_id) {
      // Manager or Team Lead → all timesheets of their department
      const employees = await Employee.find({ department_id }).select("_id");
      filter.employee_id = { $in: employees.map(e => e._id) };
    } 
    else if (role === "employee" && employee_id) {
      // Employee → only their own timesheets
      filter.employee_id = employee_id;
    } 
    else {
      return res.status(400).json({ success: false, message: "Invalid role or missing identifiers" });
    }

    const timesheets = await Timesheet.find(filter)
      .populate("employee_id", "full_name")
      .populate("project_id", "name")
      .populate("task_id", "title name")
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: timesheets.length, data: timesheets });
  } catch (error) {
    console.error("❌ getTimesheetsByRole error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * 📁 GET /api/timesheets/projects/by-role
 * Return projects filtered by user role
 */
export const getProjectsByRole = async (req, res) => {
  try {
    const { role, employee_id, department_id } = req.query;
    let filter = {};

    if (role === "admin") {
      // 🟩 Admin → all projects
      filter = {};
    } 
    else if (role === "manager" || role === "team_lead") {
      // 🟦 Manager / Team Lead → only projects in their department
      if (!department_id) {
        return res.status(400).json({
          success: false,
          message: "Department ID is required for manager/team lead",
        });
      }
      filter.department_id = department_id;
    } 
    else if (role === "employee") {
      // 🟨 Employee → only projects they are a member of
      if (!employee_id) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required for employee",
        });
      }
      filter.members = employee_id;
    } 
    else {
      return res.status(400).json({
        success: false,
        message: "Invalid role value",
      });
    }

    const projects = await Project.find(filter)
      .populate("department_id", "name")
      .populate("manager_id", "full_name email")
      .populate("team_lead_id", "full_name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    console.error("❌ getProjectsByRole error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching projects by role",
      error: error.message,
    });
  }
};

// 🗑️ DELETE /api/timesheets/delete/by-selection
// Delete only the task timesheets if task_id provided; otherwise, project-level ones
export const deleteTimesheetsBySelection = async (req, res) => {
  try {
    const { employee_id, project_id, task_id } = req.query;

    if (!employee_id || !project_id) {
      return res.status(400).json({
        success: false,
        message: "Employee ID and Project ID are required",
      });
    }

    let filter = { employee_id };

    // 🧠 If task_id is provided → delete only that task
    if (task_id && task_id !== "") {
      filter.task_id = task_id;
    } 
    // 🧠 Otherwise delete by project only
    else {
      filter.project_id = project_id;
    }

    const result = await Timesheet.deleteMany(filter);

    // Update project total after deletion
    await updateProjectSpentHours(project_id);

    res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message: task_id
        ? `Deleted ${result.deletedCount} timesheet(s) for this task.`
        : `Deleted ${result.deletedCount} timesheet(s) for this project.`,
    });
  } catch (error) {
    console.error("❌ deleteTimesheetsBySelection error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting timesheets",
      error: error.message,
    });
  }
};


