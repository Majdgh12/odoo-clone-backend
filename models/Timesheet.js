import mongoose from "mongoose";

const timesheetSchema = new mongoose.Schema(
  {
    // The employee who logged the time
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },

    // Related project (optional but usually filled)
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },

    // Related task (optional but highly common)
    task_id: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },

    // Description of the work done
    description: { type: String },

    // The date this work was done (not creation date)
    date: { type: Date, required: true, default: Date.now },

    // Time tracking
    start_time: { type: Date },
    end_time: { type: Date },
    duration: { type: Number, required: true, default: 0 }, // total hours/minutes spent

    // Optional: If timesheets are validated or billed
    is_billable: { type: Boolean, default: false },
    billed: { type: Boolean, default: false },
    validated: { type: Boolean, default: false },

    // For approval or notes by manager/team lead
    approved_by: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    approval_date: { type: Date },

    // Link to company/department (helpful for filtering)
    department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },

    // Accounting/billing context
    hourly_rate: { type: Number }, // for cost calculations
    total_cost: { type: Number }, // duration * hourly_rate if applicable

    // metadata or custom info
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

const Timesheet =
  mongoose.models.Timesheet || mongoose.model("Timesheet", timesheetSchema);
export default Timesheet;
