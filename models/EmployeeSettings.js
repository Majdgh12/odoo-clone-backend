import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  employee_type: { type: String, enum: ["Full-time","Part-time","Contractor"] },
  related_user: String,
  hourly_cost: Number,
  pos_pin_code: String,
  badge_id: String
});

const EmployeeSettings = mongoose.model("EmployeeSettings", settingsSchema);
export default EmployeeSettings;
