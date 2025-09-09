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