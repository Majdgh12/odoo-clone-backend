import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  date_from: Date,
  date_to: Date,
  title: String,
  job_description: String
});

const Experience = mongoose.model("Experience", experienceSchema);
export default Experience;
