// routes/department-routes.js
import express from "express";
import * as DepartmentController from "../controllers/department-controller.js";

const router = express.Router();

// ✅ Get all departments
// GET /api/departments
router.get("/", async (req, res) => {
  try {
    const departments = await DepartmentController.getDepartments();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get department by ID
// GET /api/departments/:id
router.get("/:id", async (req, res) => {
  try {
    const department = await DepartmentController.getDepartmentById(req.params.id);
    res.json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Create department
// POST /api/departments
router.post("/", async (req, res) => {
  try {
    const department = await DepartmentController.createDepartment(req.body);
    res.status(201).json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update department
// PUT /api/departments/:id
router.put("/:id", async (req, res) => {
  try {
    const department = await DepartmentController.updateDepartment(req.params.id, req.body);
    res.json(department);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete department
// DELETE /api/departments/:id
router.delete("/:id", async (req, res) => {
  try {
    await DepartmentController.deleteDepartment(req.params.id);
    res.json({ message: "Department deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get employees in department
// GET /api/departments/:id/employees
router.get("/:id/employees", async (req, res) => {
  try {
    const employees = await DepartmentController.getDepartmentEmployees(req.params.id);
    res.json(employees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Assign manager to department
router.put("/:departmentId/assign-manager", async (req, res) => {
  try {
    const { manager_id } = req.body;
    const { departmentId } = req.params;

    if (!manager_id) {
      return res.status(400).json({ error: "manager_id is required" });
    }

    const result = await DepartmentController.assignManager(departmentId, manager_id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
