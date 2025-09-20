import express from "express";
import * as EmployeeController from "../controllers/employee-controller.js";

const router = express.Router();

// Get all employees with full details
// GET /api/employees
router.get("/", async (req, res) => {
  try {
    const employees = await EmployeeController.getEmployees();
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get employee by ID
// GET /api/employees/:id
router.get("/:id", async (req, res) => {
  try {
    console.log("Employee ID received:", req.params.id);  // 👀 check for %0A or spaces
    const employee = await EmployeeController.getEmployeeById(req.params.id);
    res.json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Filter by department
// GET /api/employees/department/:departmentId
router.get("/department/:departmentId", async (req, res) => {
  try {
    const employees = await EmployeeController.getEmployeesByDepartment(req.params.departmentId);
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Create new employee (+ linked user account)
// POST /api/employees
router.post("/", async (req, res) => {
  try {
    const employee = await EmployeeController.createEmployee(req.body);
    res.status(201).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- PUT ----------------

// Update employee details
// PUT /api/employees/:id
// employee-routes.js
router.put("/:id", async (req, res) => {
  try {
    const updatedEmployee = await EmployeeController.updateEmployee(req.params.id, req.body);
    res.json(updatedEmployee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Change employee role (update User.role)
// PUT /api/employees/:id/role
router.put("/:id/role", async (req, res) => {
  try {
    const updatedUser = await EmployeeController.updateEmployeeRole(req.params.id, req.body.role);
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------- DELETE ----------------

// Delete employee (+ linked user)
// DELETE /api/employees/:id
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await EmployeeController.deleteEmployee(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



export default router;