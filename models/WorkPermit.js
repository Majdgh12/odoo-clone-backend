import mongoose from "mongoose";

const workPermitSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  visa_no: String,
  work_permit: String,
  visa_expiration: Date,
  permit_expiration: Date
});

const WorkPermit = mongoose.model("WorkPermit", workPermitSchema);
export default WorkPermit;
