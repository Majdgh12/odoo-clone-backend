import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["admin", "manager", "team_lead", "employee"], 
    required: true 
  },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // link to employee profile
});

export default mongoose.model("User", userSchema);
