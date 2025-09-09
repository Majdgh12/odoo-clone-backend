import mongoose from "mongoose";

const hierarchySchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  manager_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }
});

const EmployeeHierarchy = mongoose.model("EmployeeHierarchy", hierarchySchema);
export default EmployeeHierarchy;
