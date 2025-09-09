import mongoose from "mongoose";

const eduPrivateSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  certificate_level: String,
  field_of_study: String,
  school: String
});

const EducationPrivate = mongoose.model("EducationPrivate", eduPrivateSchema);
export default EducationPrivate;
