// Handles private info (like address, phone, etc.).
// Functions:

// getEmployeePrivateInfo → Return private info for one employee.
import mongoose from "mongoose";
import EmergencyContact from "../models/EmergencyContact.js";
import FamilyStatus from "../models/FamilyStatus.js";
import EducationPrivate from "../models/EducationPrivate.js";
import Education from "../models/Education.js";
import WorkPermit from "../models/WorkPermit.js";
import PrivateContact from "../models/PrivateContact.js";

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



export const updatePrivateInfo = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const {
      education,
      emergencyContact,
      familyStatus,
      workPermit,
      privateContact,
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ message: "Invalid employee ID" });
    }

    const updateField = async (Model, data) => {
      if (!data) return null;

      // Build update object with only provided fields
      const updateData = {};
      Object.keys(data).forEach((key) => {
        if (data[key] !== undefined) updateData[key] = data[key];
      });

      // Update or create document
      return await Model.findOneAndUpdate(
        { employee_id: employeeId },
        updateData,
        { new: true, upsert: true }
      );
    };

    const updatedEducation = await updateField(Education, education);
    const updatedEmergency = await updateField(EmergencyContact, emergencyContact);
    const updatedFamily = await updateField(FamilyStatus, familyStatus);
    const updatedWorkPermit = await updateField(WorkPermit, workPermit);
    const updatedPrivateContact = await updateField(PrivateContact, privateContact);

    res.status(200).json({
      message: "Private information updated successfully",
      education: updatedEducation?.toObject({ getters: true }),
      emergencyContact: updatedEmergency?.toObject({ getters: true }),
      familyStatus: updatedFamily?.toObject({ getters: true }),
      workPermit: updatedWorkPermit?.toObject({ getters: true }),
      privateContact: updatedPrivateContact?.toObject({ getters: true }),
    });
  } catch (error) {
    console.error("Update private info error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

