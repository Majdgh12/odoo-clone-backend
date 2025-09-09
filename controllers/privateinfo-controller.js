// Handles private info (like address, phone, etc.).
// Functions:

// getEmployeePrivateInfo → Return private info for one employee.
import mongoose from "mongoose";
import PrivateContact from "../models/PrivateContact.js";
import EmergencyContact from "../models/EmergencyContact.js";
import FamilyStatus from "../models/FamilyStatus.js";
import EducationPrivate from "../models/EducationPrivate.js";
import WorkPermit from "../models/WorkPermit.js";

export const getEmployeePrivateInfo = async (employeeId) => {
  try {
    // Validate employeeId
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new Error("Invalid employee ID");
    }

    const empObjectId = new mongoose.Types.ObjectId(employeeId);

    // Fetch all private info parts in parallel
    const [contact, emergencyContacts, familyStatus, educationPrivates, workPermits] =
      await Promise.all([
        PrivateContact.findOne({ employee_id: empObjectId }),
        EmergencyContact.find({ employee_id: empObjectId }),
        FamilyStatus.findOne({ employee_id: empObjectId }),
        EducationPrivate.find({ employee_id: empObjectId }),
        WorkPermit.find({ employee_id: empObjectId })
      ]);

    // Combine into one object
    const privateInfo = {
      contact,
      emergencyContacts,
      familyStatus,
      educationPrivates,
      workPermits
    };

    return privateInfo;
  } catch (err) {
    console.error("Error fetching employee private info:", err);
    throw err;
  }
};


/**
 * getAllPrivateInfo → Return private info for all employees
 * (PrivateContact, EmergencyContact, FamilyStatus, EducationPrivate, WorkPermit)
 */
export const getAllPrivateInfo = async (req, res) => {
  try {
    const [privateContacts, emergencyContacts, familyStatuses, educations, workPermits] =
      await Promise.all([
        PrivateContact.find().populate("employee_id"),
        EmergencyContact.find().populate("employee_id"),
        FamilyStatus.find().populate("employee_id"),
        EducationPrivate.find().populate("employee_id"),
        WorkPermit.find().populate("employee_id")
      ]);

    res.status(200).json({
      privateContacts,
      emergencyContacts,
      familyStatuses,
      educations,
      workPermits
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching all private info", error });
  }
};

