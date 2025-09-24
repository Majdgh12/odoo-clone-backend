// controllers/department-controller.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import User from "../models/user.js";

// ✅ Get all departments
export const getDepartments = async () => {
  try {
    const departments = await Department.find();
    return departments;
  } catch (err) {
    console.error("Error fetching departments:", err);
    throw err;
  }
};

// ✅ Get department by ID
export const getDepartmentById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid department ID");
    }
    const department = await Department.findById(id);
    return department;
  } catch (err) {
    console.error("Error fetching department by ID:", err);
    throw err;
  }
};

// ✅ Create department
export const createDepartment = async (data) => {
  try {
    const department = new Department(data);
    await department.save();
    return department;
  } catch (err) {
    console.error("Error creating department:", err);
    throw err;
  }
};

// ✅ Update department
export const updateDepartment = async (id, data) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid department ID");
    }
    const department = await Department.findByIdAndUpdate(id, data, { new: true });
    return department;
  } catch (err) {
    console.error("Error updating department:", err);
    throw err;
  }
};

// ✅ Delete department
export const deleteDepartment = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid department ID");
    }
    const department = await Department.findByIdAndDelete(id);
    return department;
  } catch (err) {
    console.error("Error deleting department:", err);
    throw err;
  }
};

// ✅ Get employees in a specific department
export const getDepartmentEmployees = async (departmentId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      throw new Error("Invalid department ID");
    }

    const employees = await Employee.find({
      department_id: new mongoose.Types.ObjectId(departmentId),
    });

    return employees;
  } catch (err) {
    console.error("Error fetching employees by department:", err);
    throw err;
  }
};

export const assignManager = async (departmentId, managerId) => {
  try {
    if (
      !mongoose.Types.ObjectId.isValid(departmentId) ||
      !mongoose.Types.ObjectId.isValid(managerId)
    ) {
      throw new Error("Invalid department ID or manager ID");
    }

    // 1. Update department with new manager
    const department = await Department.findByIdAndUpdate(
      departmentId,
      { manager_id: new mongoose.Types.ObjectId(managerId) },
      { new: true }
    );
    if (!department) throw new Error("Department not found");

    // 2. Find manager employee
    const manager = await Employee.findById(managerId);
    if (!manager) throw new Error("Employee not found");

    // 3. Update employee → set role = manager + link to department
    manager.role = "manager";
    manager.department_id = department._id;
    await manager.save();

    // 4. Delete any old user linked to this employee (remove seed accounts)
    await User.deleteOne({ employee: managerId });

    // 5. Generate credentials for new user
    const firstName = manager.full_name.split(" ")[0].toLowerCase();
    const plainPassword = `${firstName}123`;

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // 6. Create new User for this manager
    const user = new User({
      employee: managerId,
      email: manager.work_email,
      password: hashedPassword,
      role: "manager",
    });

    await user.save();

    console.log(
      `✅ User created for manager: ${manager.full_name}, email: ${manager.work_email}, password: ${plainPassword}`
    );

    return {
      message: "Manager assigned successfully and user created",
      department,
      manager,
      user,
      plainPassword, // optional: remove if you don’t want to return it
    };
  } catch (err) {
    console.error("❌ Error assigning manager:", err);
    throw err;
  }
};


