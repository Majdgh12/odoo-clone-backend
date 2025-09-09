import mongoose from "mongoose";

const languageSkillSchema = new mongoose.Schema({
  employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
  language_name: String,
  level: String, // Fluent, Good, etc.
  percentage: Number
});

const LanguageSkill = mongoose.model("LanguageSkill", languageSkillSchema);
export default LanguageSkill;
