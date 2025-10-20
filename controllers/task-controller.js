// controllers/task-controller.js
import Task from "../models/Task.js";
import Project from "../models/Project.js";
import Employee from "../models/Employee.js";

/**
 * @desc Get all tasks (optionally filtered by project or assignee)
 * @route GET /api/tasks
 * @access Authenticated
 */
export const getTasks = async (req, res) => {
  try {
    const { project_id, assignee } = req.query;

    const filter = {};
    if (project_id) filter.project_id = project_id;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
      .populate("project_id", "name status")
      .populate("assignee", "full_name job_position")
      .populate("created_by", "full_name job_position")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("❌ getTasks error:", error);
    res.status(500).json({ error: "Server error while fetching tasks" });
  }
};

/**
 * @desc Create a new task under a project
 * @route POST /api/tasks
 * @access Authenticated + Manager or Team Lead (depending on permissions)
 */
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project_id,
      assignee,
      due_date,
      priority,
      estimated_hours,
    } = req.body;

    if (!title || !project_id)
      return res.status(400).json({ error: "Title and project_id are required" });

    const project = await Project.findById(project_id);
    if (!project)
      return res.status(404).json({ error: "Project not found" });

    // Ensure user is manager, team lead, or project member
    const userId = req.user?._id || "68c96d83518a89f1206303d2";
    const isManager = project.manager_id?.equals(userId);
    const isTeamLead = project.team_lead_id?.equals(userId);
    const isMember = project.members?.some(m => m.equals(userId));

    /*if (!isManager && !isTeamLead && !isMember)
      return res.status(403).json({ error: "You are not allowed to create tasks in this project" });*/

    const newTask = await Task.create({
      title,
      description,
      project_id,
      created_by: userId,
      assignee,
      due_date,
      priority,
      estimated_hours,
      status: "todo",
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error("❌ createTask error:", error);
    res.status(500).json({ error: "Server error while creating task" });
  }
};

/**
 * @desc Update task details (status, title, etc.)
 * @route PUT /api/tasks/:id
 * @access Authenticated + Manager/TeamLead/Assignee
 */

export const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;

    // Find the task first
    const task = await Task.findById(taskId);
    if (!task)
      return res.status(404).json({ success: false, message: "Task not found" });

    // Apply updates
    Object.keys(updates).forEach((key) => {
      task[key] = updates[key];
    });

    // Save changes
    const updatedTask = await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    console.error("❌ updateTask error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while updating task",
      error: error.message,
    });
  }
};


/**
 * @desc Delete a task
 * @route DELETE /api/tasks/:id
 * @access Authenticated + Manager or Team Lead
 */
export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    if (!task)
      return res.status(404).json({ error: "Task not found" });

    const project = await Project.findById(task.project_id);
    const userId = req.user?._id;

    const isManager = project.manager_id?.equals(userId);
    const isTeamLead = project.team_lead_id?.equals(userId);

    // if (!isManager && !isTeamLead)
    //   return res.status(403).json({ error: "You are not allowed to delete this task" });

    await task.deleteOne();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("❌ deleteTask error:", error);
    res.status(500).json({ error: "Server error while deleting task" });
  }
};

/**
 * @desc Add a comment to a task
 * @route POST /api/tasks/:id/comments
 * @access Authenticated
 */
/**
 * @desc Add a comment to a task
 * @route POST /api/tasks/:id/comments
 * @access Authenticated
 */
/**
 * @desc Add a comment to a task
 * @route POST /api/tasks/:id/comments
 * @access Authenticated
 */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, comments } = req.body; // Accept both 'text' and 'comments'
    
    // Use either 'text' or 'comments' field
    const commentText = text || comments;
    
    if (!commentText || commentText.trim() === '') {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const userId = req.user?._id || "68c96d83518a89f1206303d2";

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Add the comment
    task.comments.push({
      author: userId,
      text: commentText.trim(),
      created_at: new Date(),
    });

    await task.save();

    // Get the updated task with properly populated comments
    const updatedTask = await Task.findById(id)
      .populate({
        path: "comments.author",
        select: "full_name job_position"
      })
      .select("comments");

    res.status(201).json(updatedTask.comments);

  } catch (error) {
    console.error("❌ addComment error:", error);
    res.status(500).json({ 
      error: "Server error while adding comment",
      details: error.message 
    });
  }
};
/**
 * @desc Get one task by ID (with populated fields)
 * @route GET /api/tasks/:id
 * @access Authenticated
 */
export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id)
      .populate("project_id", "name status")
      .populate("assignee", "full_name job_position")
      .populate("created_by", "full_name job_position")
      .populate("comments.author", "full_name job_position");

    if (!task)
      return res.status(404).json({ error: "Task not found" });

    res.json(task);
  } catch (error) {
    console.error("❌ getTaskById error:", error);
    res.status(500).json({ error: "Server error while fetching task" });
  }
};

// Change status of a task
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params; // task id
    const { status } = req.body;
    const user = req.user;

    const allowedStatuses = [
      "todo",
      "in_progress",
      "changes_requested",
      "approved",
      "done",
      "cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const task = await Task.findById(id).populate("project_id");
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = task.project_id;

    // Authorization logic
    const isManager =
      user.role === "manager" &&
      String(user.department_id) === String(project.department_id);
    const isTeamLead = String(project.team_lead_id) === String(user._id);
    const isAssignee = task.assignees.some((a) => String(a) === String(user._id));
    const isAdmin = user.role === "admin";

    if (!isManager && !isTeamLead && !isAssignee && !isAdmin) {
      return res.status(403).json({ message: "Not allowed to change status" });
    }

    // Business logic: restrict who can move to which stage
    const restricted = {
      in_progress: ["assignee", "team_lead"],
      done: ["assignee", "manager", "team_lead"],
      approved: ["manager", "team_lead"],
      cancelled: ["manager", "admin"],
      changes_requested: ["manager", "team_lead"],
    };

    const role = user.role === "team_lead" ? "team_lead" : user.role;

    if (restricted[status] && !restricted[status].includes(role)) {
      return res.status(403).json({
        message: `Only ${restricted[status].join(", ")} can mark task as '${status}'`,
      });
    }

    task.status = status;
    await task.save();

    res.json({ message: `Task marked as ${status}`, task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
