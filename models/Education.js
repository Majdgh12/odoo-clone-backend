import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  title: String,
  from_date: Date,
  to_date: Date,
  school: String
});

const Education = mongoose.model("Education", educationSchema);
export default Education;
