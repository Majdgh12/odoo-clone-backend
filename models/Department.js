import mongoose from "mongoose";

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  company: { type: String, required: true },
  manager_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" } // optional top-level manager
});

const Department = mongoose.model("Department", departmentSchema);
export default Department;

