import express from "express";
import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import {errorHandler} from "../middleware/errorMiddleware.js";

const router = express.Router();

// GET all departments
router.get("/", async (req, res, next) => {
  try {
    const departments = await Department.find().populate("manager_id");
    res.json(departments);
  } catch (error) {
    next(error);
  }
});

// GET department by ID
router.get("/:id", async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id).populate("manager_id");
    
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    res.json(department);
  } catch (error) {
    next(error);
  }
});

// CREATE new department
router.post("/", async (req, res, next) => {
  try {
    const department = new Department(req.body);
    const savedDepartment = await department.save();
    res.status(201).json(savedDepartment);
  } catch (error) {
    next(error);
  }
});

// UPDATE department
router.put("/:id", async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    res.json(department);
  } catch (error) {
    next(error);
  }
});

// DELETE department
router.delete("/:id", async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }
    
    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// GET department employees
router.get("/:id/employees", async (req, res, next) => {
  try {
    const employees = await Employee.find({ department_id: req.params.id })
      .populate("manager_id")
      .populate("coach_id");
    
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

export default router;