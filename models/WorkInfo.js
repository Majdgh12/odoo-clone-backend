  import mongoose from "mongoose";

const workInfoSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  work_address: String,
  work_location: String,
  approver_timeoff_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  approver_timesheet_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  working_hours: String,
  timezone: String
});

const WorkInfo = mongoose.model("WorkInfo", workInfoSchema);
export default WorkInfo;
