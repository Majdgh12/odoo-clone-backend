import mongoose from "mongoose";

const familySchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  marital_status: String,
  spouse_name: String,
  spouse_birthday: Date,
  dependent_children: Number
});

const FamilyStatus = mongoose.model("FamilyStatus", familySchema);
export default FamilyStatus;
