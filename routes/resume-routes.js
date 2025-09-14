import express from "express";
import Education from "../models/Education.js";
import Experience from "../models/Experience.js";
import { errorHandler } from "../middleware/errorMiddleware.js";
const router = express.Router();

// GET all education records for an employee
router.get("/education/employee/:employeeId", async (req, res, next) => {
  try {
    const education = await Education.find({ employee_id: req.params.employeeId });
    res.json(education);
  } catch (error) {
    next(error);
  }
});

// GET education by ID
router.get("/education/:id", async (req, res, next) => {
  try {
    const education = await Education.findById(req.params.id);
    
    if (!education) {
      return res.status(404).json({ message: "Education record not found" });
    }
    
    res.json(education);
  } catch (error) {
    next(error);
  }
});

// CREATE education record
router.post("/education", async (req, res, next) => {
  try {
    const education = new Education(req.body);
    const savedEducation = await education.save();
    res.status(201).json(savedEducation);
  } catch (error) {
    next(error);
  }
});

// UPDATE education record
router.put("/education/:id", async (req, res, next) => {
  try {
    const education = await Education.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!education) {
      return res.status(404).json({ message: "Education record not found" });
    }
    
    res.json(education);
  } catch (error) {
    next(error);
  }
});

// DELETE education record
router.delete("/education/:id", async (req, res, next) => {
  try {
    const education = await Education.findByIdAndDelete(req.params.id);
    
    if (!education) {
      return res.status(404).json({ message: "Education record not found" });
    }
    
    res.json({ message: "Education record deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// GET all experience records for an employee
router.get("/experience/employee/:employeeId", async (req, res, next) => {
  try {
    const experience = await Experience.find({ employee_id: req.params.employeeId });
    res.json(experience);
  } catch (error) {
    next(error);
  }
});

// GET experience by ID
router.get("/experience/:id", async (req, res, next) => {
  try {
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ message: "Experience record not found" });
    }
    
    res.json(experience);
  } catch (error) {
    next(error);
  }
});

// CREATE experience record
router.post("/experience", async (req, res, next) => {
  try {
    const experience = new Experience(req.body);
    const savedExperience = await experience.save();
    res.status(201).json(savedExperience);
  } catch (error) {
    next(error);
  }
});

// UPDATE experience record
router.put("/experience/:id", async (req, res, next) => {
  try {
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!experience) {
      return res.status(404).json({ message: "Experience record not found" });
    }
    
    res.json(experience);
  } catch (error) {
    next(error);
  }
});

// DELETE experience record
router.delete("/experience/:id", async (req, res, next) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ message: "Experience record not found" });
    }
    
    res.json({ message: "Experience record deleted successfully" });
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

export default router;