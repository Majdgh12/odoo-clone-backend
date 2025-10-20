import mongoose from "mongoose";

const timeOffBalanceSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    year: { type: Number, default: new Date().getFullYear() },

    paid_days: { type: Number, default: 20 },           // Example default value
    compensatory_days: { type: Number, default: 16 },  // Example default value
    sick_days: { type: Number, default: 0 },

    updated_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const TimeOffBalance = mongoose.model("TimeOffBalance", timeOffBalanceSchema);
export default TimeOffBalance;
