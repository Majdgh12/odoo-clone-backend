import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  status: { type: String, enum: ["online", "offline"], default: "offline" },
  job_position: String,
  work_email: String,
  work_phone: String,
  work_mobile: String,
  image: String,
  tags: [String],
  company: String,

  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  manager_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // direct manager
  team_lead_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // NEW: for team lead link
});

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
