import mongoose from "mongoose";

const programmingSkillSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  name: String,
  level: { type: String, enum: ["Beginner","Intermediate","Advanced","Expert"] },
  percentage: Number
});

const ProgrammingSkill = mongoose.models.ProgrammingSkill || mongoose.model("ProgrammingSkill", programmingSkillSchema);
export default ProgrammingSkill;
