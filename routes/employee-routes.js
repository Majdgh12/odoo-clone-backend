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


// Search employees by term (name, position, department, tags)
// GET /api/employees/search?term=John
router.get("/search", async (req, res) => {
  try {
    const term = req.query.term || "";
    const employees = await EmployeeController.searchEmployees(term);
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Pagination
// GET /api/employees/page?page=1&limit=10
router.get("/page", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const data = await EmployeeController.getEmployeesPage(page, limit);
    res.json(data);
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

// Filter by job position
// GET /api/employees/position/:position
router.get("/position/:position", async (req, res) => {
  try {
    const employees = await EmployeeController.getEmployeesByPosition(req.params.position);
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Filter by tags
// GET /api/employees/tags?tags=tag1,tag2
router.get("/tags", async (req, res) => {
  try {
    const tags = req.query.tags ? req.query.tags.split(",") : [];
    const employees = await EmployeeController.getEmployeesByTags(tags);
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get employee stats
// GET /api/employees/stats
router.get("/stats", async (req, res) => {
  try {
    const stats = await EmployeeController.getEmployeeStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Advanced filter
// GET /api/employees/filter?departmentId=...&position=...&skills=skill1,skill2
router.get("/filter", async (req, res) => {
  try {
    const { departmentId, position, skills } = req.query;
    const skillsArray = skills ? skills.split(",") : [];
    const employees = await EmployeeController.filterEmployees({ departmentId, position, skills: skillsArray });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
