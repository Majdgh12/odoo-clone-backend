import express from "express";
import Employee from "../models/Employee.js";
import {errorHandler} from "../middleware/errorMiddleware.js";

const router = express.Router();

// GET all employees
router.get("/", async (req, res, next) => {
  try {
    const { page = 1, limit = 10, department_id, job_position, status } = req.query;
    
    const filter = {};
    if (department_id) filter.department_id = department_id;
    if (job_position) filter.job_position = job_position;
    if (status) filter.status = status;
    
    const employees = await Employee.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("department_id")
      .populate("manager_id")
      .populate("coach_id");
    
    const total = await Employee.countDocuments(filter);
    
    res.json({
      employees,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    next(error);
  }
});

// GET employee by ID
router.get("/:id", async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate("department_id")
      .populate("manager_id")
      .populate("coach_id");
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    res.json(employee);
  } catch (error) {
    next(error);
  }
});

// CREATE new employee
router.post("/", async (req, res, next) => {
  try {
    const employee = new Employee(req.body);
    const savedEmployee = await employee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    next(error);
  }
});

// UPDATE employee
router.put("/:id", async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    res.json(employee);
  } catch (error) {
    next(error);
  }
});

// DELETE employee
router.delete("/:id", async (req, res, next) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    res.json({ message: "Employee deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// GET employees by manager
router.get("/manager/:managerId", async (req, res, next) => {
  try {
    const employees = await Employee.find({ manager_id: req.params.managerId })
      .populate("department_id")
      .populate("coach_id");
    
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

// GET employees by department
router.get("/department/:departmentId", async (req, res, next) => {
  try {
    const employees = await Employee.find({ department_id: req.params.departmentId })
      .populate("manager_id")
      .populate("coach_id");
    
    res.json(employees);
  } catch (error) {
    next(error);
  }
});
router.get("/search", async (req, res, next) => {
  try {
    const term = req.query.term || "";
    
    if (!term) {
      return res.status(400).json({ error: "Search term is required" });
    }
    
    const employees = await Employee.find({
      $or: [
        { full_name: new RegExp(term, 'i') },
        { job_position: new RegExp(term, 'i') },
        { work_email: new RegExp(term, 'i') },
        { 'tags': new RegExp(term, 'i') }
      ]
    })
    .populate("department_id")
    .populate("manager_id")
    .populate("coach_id");
    
    res.json(employees);
  } catch (error) {
    next(error);
  }
});

// Error handling middleware
router.use(errorHandler);

export default router;