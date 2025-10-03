import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true ,trim:true, minlength: 2, maxlength: 30 },
  description: { type: String, trim: true, maxlength: 30 },
  company: { type: String, required: true,trim:30, maxlength: 30 },
  manager_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // top-level manager
  timestamps: true,
});

const Department = mongoose.model("Department", departmentSchema);
export default Department;
