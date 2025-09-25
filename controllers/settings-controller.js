// Handles employee settings.
// Functions:

import EmployeeSettings from "../models/EmployeeSettings.js";
import mongoose from "mongoose";
export const getEmployeeSettings = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const settings = await EmployeeSettings.findOne({ employee_id: employeeId })
      .populate("employee_id"); // optional: to include employee details

    if (!settings) {
      return res.status(404).json({ message: "Settings not found for this employee" });
    }

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee settings", error });
  }
};

// getAllEmployeeSettings → Return all settings for all employees.
export const getAllEmployeeSettings = async (req, res) => {
  try {
    const settings = await EmployeeSettings.find().populate("employee_id"); 
    // populate("employee_id") → optional, gives employee details

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee settings", error });
  }
};
export const updateEmployeeSettings = async (req, res) => {
  try {
    const { employeeId } = req.params; 

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    // ✅ Default structure for settings
    const defaultSettings = {
      employee_type: "",
      related_user: "",
      hourly_cost: 0,
      pos_pin_code: "",
      badge_id: "",
    };

    // Merge defaults with incoming body
    const updateFields = {
      ...defaultSettings,
      ...req.body, // overwrite defaults with what user sent
    };

    // Upsert: create if not exists
    const updatedSettings = await EmployeeSettings.findOneAndUpdate(
      { employee_id: employeeId },
      updateFields,
      { new: true, upsert: true } 
    );

    res.status(200).json({
      message: "Employee settings updated successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Update employee settings error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
