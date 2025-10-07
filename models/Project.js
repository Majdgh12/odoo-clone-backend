import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,

    // Link to department that owns the project (resources come from this department)
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },

    // Manager who created/owns the project (usually department manager)
    manager_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },

    // Team lead for the project
    team_lead_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },

    // Members assigned to the project (employees). An employee can be in many projects.
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],

    // Dates and status
    start_date: Date,
    end_date: Date,
    status: { type: String, default: "planned" }, // e.g. planned, active, done, canceled

    // Optional metadata
    priority: { type: String, default: "normal" }, // e.g. low, normal, high
    tags: [String],
    // any other free-form object
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const Project = mongoose.models.Project || mongoose.model("Project", projectSchema);
export default Project;
