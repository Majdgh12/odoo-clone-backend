import WorkInfo from "../models/WorkInfo.js";
import WorkPermit from "../models/WorkPermit.js";
import mongoose from "mongoose";
/**
 * getEmployeeWorkInfo → Return work info for a specific employee
 */
export const getEmployeeWorkInfo = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const workInfo = await WorkInfo.findOne({ employee_id: employeeId })
      .populate("employee_id", "full_name job_position") // optional: populate employee info
      .populate("approver_timeoff_id", "full_name")
      .populate("approver_timesheet_id", "full_name");

    if (!workInfo) {
      return res.status(404).json({ message: "Work info not found for this employee" });
    }

    res.status(200).json(workInfo);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee work info", error });
  }
};
/**
 * getAllWorkInfo → Return work info for all employees
 */
export const getAllWorkInfo = async (req, res) => {
  try {
    const allWorkInfo = await WorkInfo.find()
      .populate("employee_id", "full_name job_position")
      .populate("approver_timeoff_id", "full_name")
      .populate("approver_timesheet_id", "full_name");

    res.status(200).json(allWorkInfo);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all work info", error });
  }
};


// Update both WorkInfo and WorkPermit for an employee
export const updateEmployeeWorkData = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { workInfo = {}, workPermit = {} } = req.body;

    // validate employeeId
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    /* ---------- Prepare sanitized data for update ---------- */

    // EDITED: Use $set to update specific fields and avoid full replacement.
    const workInfoData = {
      employee_id: employeeId,
      work_address: workInfo.work_address ?? "",
      work_location: workInfo.work_location ?? "",
      working_hours: workInfo.working_hours ?? "",
      timezone: workInfo.timezone ?? "",
      approver_timeoff_id: workInfo.approver_timeoff_id || null,
      approver_timesheet_id: workInfo.approver_timesheet_id || null,
    };

    // EDITED: parse incoming date strings into Date objects (or null)
    const parsedVisaExpiration = workPermit.visa_expiration ? new Date(workPermit.visa_expiration) : null;
    const parsedPermitExpiration = workPermit.permit_expiration ? new Date(workPermit.permit_expiration) : null;
    const parseDate = (d) => {
      if (!d || d === "") return null;
      const dateObj = new Date(d);
      return isNaN(dateObj.getTime()) ? null : dateObj;
    };
    const workPermitData = {
      employee_id: employeeId,
      visa_no: workPermit.visa_no ?? "",
      work_permit: workPermit.work_permit ?? "",
       visa_expiration: parseDate(workPermit.visa_expiration),   // 🔹 edited
      permit_expiration: parseDate(workPermit.permit_expiration),
    };

    // EDITED: findOneAndUpdate with $set + upsert + setDefaultsOnInsert
    const updatedWorkInfo = await WorkInfo.findOneAndUpdate(
      { employee_id: employeeId },
      { $set: workInfoData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    const updatedWorkPermit = await WorkPermit.findOneAndUpdate(
      { employee_id: employeeId },
      { $set: workPermitData },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // EDITED: sanitize returned docs before sending to client (remove internal DB keys)
    const sanitizeDoc = (doc) => {
      if (!doc) return null;
      const obj = doc.toObject ? doc.toObject() : { ...doc };
      // remove internals
      delete obj._id;
      delete obj.employee_id;
      delete obj.__v;
      return obj;
    };

    res.status(200).json({
      message: "Employee work data updated successfully",
      workInfo: sanitizeDoc(updatedWorkInfo),
      workPermit: sanitizeDoc(updatedWorkPermit),
    });
  } catch (error) {
    console.error("Error updating employee work data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

