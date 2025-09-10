import express from "express";
import WorkInfo from "../models/WorkInfo.js";
import WorkPermit from "../models/WorkPermit.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

const router = express.Router();

// GET work info by employee ID
router.get("/employee/:employeeId", async (req, res, next) => {
  try {
    const workInfo = await WorkInfo.findOne({ employee_id: req.params.employeeId });
    
    if (!workInfo) {
      return res.status(404).json({ message: "Work information not found" });
    }
    
    res.json(workInfo);
  } catch (error) {
    next(error);
  }
});

// CREATE or UPDATE work info
router.post("/", async (req, res, next) => {
  try {
    const { employee_id, ...workData } = req.body;
    
    let workInfo = await WorkInfo.findOne({ employee_id });
    
    if (workInfo) {
      // Update existing
      workInfo = await WorkInfo.findOneAndUpdate(
        { employee_id },
        workData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new
      workInfo = new WorkInfo(req.body);
      await workInfo.save();
    }
    
    res.json(workInfo);
  } catch (error) {
    next(error);
  }
});

// Work Permit routes
router.get("/work-permit/employee/:employeeId", async (req, res, next) => {
  try {
    const workPermit = await WorkPermit.findOne({ employee_id: req.params.employeeId });
    
    if (!workPermit) {
      return res.status(404).json({ message: "Work permit not found" });
    }
    
    res.json(workPermit);
  } catch (error) {
    next(error);
  }
});

router.post("/work-permit", async (req, res, next) => {
  try {
    const { employee_id, ...permitData } = req.body;
    
    let workPermit = await WorkPermit.findOne({ employee_id });
    
    if (workPermit) {
      // Update existing
      workPermit = await WorkPermit.findOneAndUpdate(
        { employee_id },
        permitData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new
      workPermit = new WorkPermit(req.body);
      await workPermit.save();
    }
    
    res.json(workPermit);
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

export default router;