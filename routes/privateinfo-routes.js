import express from "express";
import PrivateContact from "../models/PrivateContact.js";
import { errorHandler } from "../middleware/errorMiddleware.js";

const router = express.Router();

// GET private info by employee ID
router.get("/employee/:employeeId", async (req, res, next) => {
  try {
    const privateInfo = await PrivateContact.findOne({ employee_id: req.params.employeeId });
    
    if (!privateInfo) {
      return res.status(404).json({ message: "Private information not found" });
    }
    
    res.json(privateInfo);
  } catch (error) {
    next(error);
  }
});

// CREATE or UPDATE private info
router.post("/", async (req, res, next) => {
  try {
    const { employee_id, ...privateData } = req.body;
    
    let privateInfo = await PrivateContact.findOne({ employee_id });
    
    if (privateInfo) {
      // Update existing
      privateInfo = await PrivateContact.findOneAndUpdate(
        { employee_id },
        privateData,
        { new: true, runValidators: true }
      );
    } else {
      // Create new
      privateInfo = new PrivateContact(req.body);
      await privateInfo.save();
    }
    
    res.json(privateInfo);
  } catch (error) {
    next(error);
  }
});

// DELETE private info
router.delete("/:id", async (req, res, next) => {
  try {
    const privateInfo = await PrivateContact.findByIdAndDelete(req.params.id);
    
    if (!privateInfo) {
      return res.status(404).json({ message: "Private information not found" });
    }
    
    res.json({ message: "Private information deleted successfully" });
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

export default router;