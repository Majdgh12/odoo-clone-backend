// controllers/projectController.js
import Project from "../models/Project.js";
import Employee from "../models/Employee.js";
import User from "../models/user.js"
import mongoose from "mongoose";
import Department from "../models/Department.js";
import Task from "../models/Task.js";
// GET all projects
export const getProjects = async (req, res) => {
  try {
    const { departmentId } = req.query;

    // Filter by department if provided
    const filter = {};
    if (departmentId) {
      filter.department_id = departmentId;
    }

    // Fetch projects with populated fields
    const projects = await Project.find(filter)
      .populate("department_id", "name")       // department name
      .populate("manager_id", "full_name work_email")
      .populate("team_lead_id", "full_name work_email")
      .populate("members", "full_name work_email");

    // Get department name if departmentId provided
    let departmentName = null;
    if (departmentId && projects.length > 0) {
      // department_id is populated
      departmentName = projects[0].department_id?.name || null;
    }

    res.status(200).json({
      success: true,
      departmentName,  // ✅ send department name
      data: projects,
    });
  } catch (error) {
    console.error("❌ Error fetching projects:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

//create project
export const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      department_id,
      manager_id,
      team_lead_id,
      members,
      start_date,
      end_date,
      status,
      priority,
      tags,
      meta,
    } = req.body;

    // Validation: name & department_id required
    if (!name || !department_id) {
      return res.status(400).json({ success: false, message: "Project name and department_id are required" });
    }

    // Optional: if manager_id is not provided, set current user if they are manager
    const project = new Project({
      name,
      description,
      department_id,
      manager_id: manager_id || req.user._id,
      team_lead_id,
      members,
      start_date,
      end_date,
      status: status || "planned",
      priority: priority || "normal",
      tags,
      meta,
    });

    const savedProject = await project.save();

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: savedProject,
    });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};
//update project 
export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const updates = req.body;

    // Find the project first
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    // Apply updates
    Object.keys(updates).forEach((key) => {
      project[key] = updates[key];
    });

    const updatedProject = await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updatedProject,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
//delete project
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    // Check authorization: admin or manager of department
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (
      user.role !== "admin" &&
      !(user.role === "manager" && String(user.department_id) === String(project.department_id))
    ) {
      return res.status(403).json({ success: false, message: "Forbidden - not allowed to delete this project" });
    }

    await project.deleteOne();

    return res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// asign team lead
export const assignTeamLead = async (req, res) => {
  try {
    const { id } = req.params; // project ID
    const { team_lead_id } = req.body;

    if (!team_lead_id) {
      return res.status(400).json({ success: false, message: "team_lead_id is required" });
    }

    // 🔹 Find the project
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // 🔹 Check permissions
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (
      user.role !== "admin" &&
      !(user.role === "manager" && String(user.department_id) === String(project.department_id))
    ) {
      return res.status(403).json({ success: false, message: "Forbidden - only admin/manager can assign team lead" });
    }

    // 🔹 Assign the new team lead to the project
    project.team_lead_id = team_lead_id;
    await project.save();

    // 🔹 Find user linked to this employee and update role
    const updatedUser = await User.findOneAndUpdate(
      { employee: new mongoose.Types.ObjectId(team_lead_id) },  // ✅ make sure to cast to ObjectId
      { $set: { role: "team_lead" } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User linked to this employee not found. Make sure the 'employee' field matches the ID."
      });
    }

    return res.status(200).json({
      success: true,
      message: "✅ Team lead assigned successfully and user role updated",
      data: { project, team_lead_user: updatedUser }
    });
  } catch (error) {
    console.error("Error assigning team lead:", error);
    return res.status(500).json({ success: false, message: error.message || "Server error" });
  }
};
// add members
export const addProjectMembers = async (req, res) => {
  try {
    const { id } = req.params; // project ID
    const { members } = req.body; // array of member IDs

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Members array is required",
      });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Optional: permission check (you can comment out for testing)
     const user = req.user;
     if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });
     if (user.role !== "admin" && !(user.role === "manager" && String(user.department_id) === String(project.department_id))) {
       return res.status(403).json({ success: false, message: "Forbidden - only admin/manager can add members" });
     }

    // Optional: validate that member IDs exist in Employee collection
    const validMembers = await Employee.find({ _id: { $in: members } });
     if (validMembers.length !== members.length) {
       return res.status(400).json({ success: false, message: "One or more members are invalid" });
     }

    // Avoid duplicates
    const existingMembers = new Set(project.members.map(m => m.toString()));
    const newMembers = members.filter(m => !existingMembers.has(m));

    if (newMembers.length === 0) {
      return res.status(400).json({ success: false, message: "All members already exist in this project" });
    }

    project.members.push(...newMembers);
    await project.save();

    return res.status(200).json({
      success: true,
      message: "Members added successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error adding members:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
//remove members
export const removeProjectMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Optional: permission check (commented for testing)
     const user = req.user;
     if (!user) return res.status(401).json({ success: false, message: "Unauthorized" });
     if (user.role !== "admin" && !(user.role === "manager" && String(user.department_id) === String(project.department_id))) {
     return res.status(403).json({ success: false, message: "Forbidden - only admin/manager can remove members" });
     }

    const beforeCount = project.members.length;
    project.members = project.members.filter(m => m.toString() !== memberId);

    if (project.members.length === beforeCount) {
      return res.status(404).json({
        success: false,
        message: "Member not found in project",
      });
    }

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
      data: project,
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
//get project details
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the project with populated relations
    const project = await Project.findById(id)
      .populate("department_id", "name") // show department name
      .populate("manager_id", "name email")
      .populate("team_lead_id", "name email")
      .populate("members", "name email")
      .lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Fetch project tasks (if Task model exists)
    const tasks = await Task.find({ project_id: id }).select("title status assigned_to due_date").lean();

    // Add tasks to the response
    project.tasks = tasks;

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
//get project by department
export const getProjectsByDepartment = async (req, res) => {
  const { departmentId } = req.params;

  // Optional: user info for role-based access
  const user = req.user;

  try {
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const department = await Department.findById(departmentId).lean();
    if (!department) return res.status(404).json({ message: "Department not found" });

    // Optional role-based check
    if (user && user.role === "manager" && String(user.department_id) !== String(departmentId)) {
      return res.status(403).json({ message: "Forbidden - not your department" });
    }

    const projects = await Project.find({ department_id: department._id }) // use department._id
      .populate("manager_id", "name email")
      .populate("team_lead_id", "name email")
      .populate("members", "name email")
      .lean();

    return res.status(200).json({ department, projects });
  } catch (err) {
    console.error("Error fetching projects by department:", err);
    return res.status(500).json({ message: "Server error" });
  }
};