import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    // Which project this task belongs to
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },

    // Who created the task (team lead or manager)
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },

    // Who is assigned to do the task
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },

    // Task scheduling & progress
    due_date: Date,
    started_at: Date,
    completed_at: Date,
    status: { type: String, default: "todo" }, // e.g. todo, in_progress, done, blocked
    priority: { type: String, default: "normal" }, // low, normal, high

    // Optional fields for tracking
    estimated_hours: Number,
    spent_hours: { type: Number, default: 0 },

    // comments or arbitrary data
    comments: [{ author: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, text: String, created_at: Date }],

    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
export default Task;
