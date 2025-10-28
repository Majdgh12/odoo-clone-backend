import mongoose from "mongoose";

const timeOffRequestSchema = new mongoose.Schema(
  {
    employee_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    approver_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // Manager or Admin

    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    number_of_days: { type: Number, required: true },

    type: {
      type: String,
      enum: ["Paid", "Compensatory", "Sick","Remote"],
      required: true
    },
     duration: {
      type: String,
      enum: ["Full Day", "Half Day"],   
      default: "Full Day"
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },

    comment: { type: String, default: "" },

    // For audit trail
    created_at: { type: Date, default: Date.now },
    approved_at: { type: Date }
  },
  { timestamps: true }
);

const TimeOffRequest = mongoose.model("TimeOffRequest", timeOffRequestSchema);
export default TimeOffRequest;
