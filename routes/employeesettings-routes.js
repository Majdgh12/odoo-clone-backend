import express from "express";
import EmployeeSettings from "../models/EmployeeSettings.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

const router = express.Router();

// GET settings
router.get("/", async (req, res, next) => {
  try {
    const settings = await EmployeeSettings.findOne();
    
    if (!settings) {
      // Create default settings if none exist
      const defaultSettings = new EmployeeSettings();
      const savedSettings = await defaultSettings.save();
      return res.json(savedSettings);
    }
    
    res.json(settings);
  } catch (error) {
    next(error);
  }
});

// UPDATE settings
router.put("/", async (req, res, next) => {
  try {
    let settings = await EmployeeSettings.findOne();
    
    if (!settings) {
      settings = new EmployeeSettings(req.body);
    } else {
      settings = await EmployeeSettings.findOneAndUpdate(
        {},
        req.body,
        { new: true, runValidators: true, upsert: true }
      );
    }
    
    const savedSettings = await settings.save();
    res.json(savedSettings);
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

export default router;