import express from "express";
import LanguageSkill from "../models/LanguageSkill.js";
import ProgrammingSkill from "../models/ProgrammingSkill.js";
import OtherSkill from "../models/OtherSkill.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

const router = express.Router();

// GET all skills for an employee
router.get("/employee/:employeeId", async (req, res, next) => {
  try {
    const [languageSkills, programmingSkills, otherSkills] = await Promise.all([
      LanguageSkill.find({ employee_id: req.params.employeeId }),
      ProgrammingSkill.find({ employee_id: req.params.employeeId }),
      OtherSkill.find({ employee_id: req.params.employeeId })
    ]);
    
    res.json({
      languageSkills,
      programmingSkills,
      otherSkills
    });
  } catch (error) {
    next(error);
  }
});

// Language Skills routes
router.get("/languages/employee/:employeeId", async (req, res, next) => {
  try {
    const languageSkills = await LanguageSkill.find({ employee_id: req.params.employeeId });
    res.json(languageSkills);
  } catch (error) {
    next(error);
  }
});

router.post("/languages", async (req, res, next) => {
  try {
    const languageSkill = new LanguageSkill(req.body);
    const savedSkill = await languageSkill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    next(error);
  }
});

router.delete("/languages/:id", async (req, res, next) => {
  try {
    const skill = await LanguageSkill.findByIdAndDelete(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ message: "Language skill not found" });
    }
    
    res.json({ message: "Language skill deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Programming Skills routes
router.get("/programming/employee/:employeeId", async (req, res, next) => {
  try {
    const programmingSkills = await ProgrammingSkill.find({ employee_id: req.params.employeeId });
    res.json(programmingSkills);
  } catch (error) {
    next(error);
  }
});

router.post("/programming", async (req, res, next) => {
  try {
    const programmingSkill = new ProgrammingSkill(req.body);
    const savedSkill = await programmingSkill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    next(error);
  }
});

router.delete("/programming/:id", async (req, res, next) => {
  try {
    const skill = await ProgrammingSkill.findByIdAndDelete(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ message: "Programming skill not found" });
    }
    
    res.json({ message: "Programming skill deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// Other Skills routes
router.get("/other/employee/:employeeId", async (req, res, next) => {
  try {
    const otherSkills = await OtherSkill.find({ employee_id: req.params.employeeId });
    res.json(otherSkills);
  } catch (error) {
    next(error);
  }
});

router.post("/other", async (req, res, next) => {
  try {
    const otherSkill = new OtherSkill(req.body);
    const savedSkill = await otherSkill.save();
    res.status(201).json(savedSkill);
  } catch (error) {
    next(error);
  }
});

router.delete("/other/:id", async (req, res, next) => {
  try {
    const skill = await OtherSkill.findByIdAndDelete(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }
    
    res.json({ message: "Skill deleted successfully" });
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

export default router;