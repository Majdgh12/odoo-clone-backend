import mongoose from "mongoose";

const emergencySchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  contact_name: String,
  contact_phone: String
});

const EmergencyContact = mongoose.model("EmergencyContact", emergencySchema);
export default EmergencyContact;
