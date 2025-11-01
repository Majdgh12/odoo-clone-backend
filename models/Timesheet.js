import mongoose from "mongoose";

const timesheetSchema = new mongoose.Schema(
  {
    // Employee who logged the time
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },

    // Related project (optional)
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },

    // Related task (optional)
    task_id: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },

    // Description of the work done
    description: { type: String, default: "" },

    // Date this work was done
    date: { type: Date, required: true, default: Date.now },

    // Time tracking
    start_time: { type: Date },
    end_time: { type: Date },
    duration: { type: Number, required: true, default: 0 }, // total hours/minutes spent

    // Approval info
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    approval_date: { type: Date },

    // Link to company/department
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },


    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const Timesheet =
  mongoose.models.Timesheet || mongoose.model("Timesheet", timesheetSchema);
export default Timesheet;
