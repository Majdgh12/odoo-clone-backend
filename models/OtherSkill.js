import mongoose from "mongoose";

const otherSkillSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  category: String,
  skill_name: String,
  level: String,
  percentage: Number
});

const OtherSkill = mongoose.model("OtherSkill", otherSkillSchema);
export default OtherSkill;
