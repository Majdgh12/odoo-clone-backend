import TimeOffBalance from "../models/timeOffBalance.js";
import mongoose from "mongoose";
// 🟢 Get balance for an employee
export const getBalance = async (req, res) => {
const employeeId = req.params.employeeId?.trim();

  if (!employeeId) return res.status(400).json({ message: "Employee ID is required" });

  try {
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid Employee ID" });
    }

    const balance = await TimeOffBalance.findOne({
      employee_id: employeeId, // Mongoose can handle string ObjectId
      year: new Date().getFullYear(),
    });

    if (!balance) {
      console.log("No balance found for employee:", employeeId);
      return res.status(404).json({ message: "No balance found" });
    }

    // Map DB fields to frontend expectation
    res.json({
      paid: balance.paid_days,
      compensatory: balance.compensatory_days,
      sick: balance.sick_days,
    });
  } catch (error) {
    console.error("Error in getBalance:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// 🟡 Update balance manually (admin use)
export const updateBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { paid_days, compensatory_days, sick_days } = req.body;

    const balance = await TimeOffBalance.findOneAndUpdate(
      { employee_id: employeeId, year: new Date().getFullYear() },
      { paid_days, compensatory_days, sick_days },
      { new: true, upsert: true }
    );

    res.json(balance);
  } catch (error) {
    console.error("Error updating balance:", error);
    res.status(500).json({ message: "Server error" });
  }
};
