// 2️⃣ departmentController.js

// Handles department-related operations.
// Functions:

// getDepartments → Return all departments.

// getDepartmentEmployees → Return all employees in a specific department.
import Department from "../models/Department.js";
import mongoose from "mongoose";

export const getDepartments = async () => {
  try {
    const departments = await Department.find(); // fetch all departments
    return departments;
  } catch (err) {
    console.error("Error fetching departments:", err);
    throw err;
  }
};
import mongoose from "mongoose";
import Employee from "../models/Employee.js";

export const getDepartmentEmployees = async (departmentId) => {
  try {
    // Validate departmentId
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      throw new Error("Invalid department ID");
    }

    // Find all employees in the department
    const employees = await Employee.find({
      department_id: new mongoose.Types.ObjectId(departmentId)
    });

    return employees;
  } catch (err) {
    console.error("Error fetching employees by department:", err);
    throw err;
  }
};
