// Handles resume information.
// Functions:

// getEmployeeResume → Return resume for a specific employee.

// getAllResumes → Return all resumes across employees.
import mongoose from "mongoose";
import Experience from "../models/Experience.js";
import Education from "../models/Education.js";
import LanguageSkill from "../models/LanguageSkill.js";
import OtherSkill from "../models/OtherSkill.js";

export const getEmployeeResume = async (employeeId) => {
  try {
    // Validate employeeId
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new Error("Invalid employee ID");
    }

    const empObjectId = new mongoose.Types.ObjectId(employeeId);

    // Fetch all resume parts in parallel
    const [experiences, educations, languageSkills, otherSkills] = await Promise.all([
      Experience.find({ employee_id: empObjectId }).sort({ date_from: -1 }),
      Education.find({ employee_id: empObjectId }).sort({ from_date: -1 }),
      LanguageSkill.find({ employee_id: empObjectId }),
      OtherSkill.find({ employee_id: empObjectId })
    ]);

    // Combine into one resume object
    const resume = {
      experiences,
      educations,
      languageSkills,
      otherSkills
    };

    return resume;
  } catch (err) {
    console.error("Error fetching employee resume:", err);
    throw err;
  }
};

export const getAllResumes = async () => {
  try {
    // Fetch all collections in parallel
    const [experiences, educations, languageSkills, otherSkills] = await Promise.all([
      Experience.find().sort({ date_from: -1 }),
      Education.find().sort({ from_date: -1 }),
      LanguageSkill.find(),
      OtherSkill.find()
    ]);

    // Group everything by employee_id
    const resumeMap = {};

    // Helper function to push items into resumeMap
    const addToResume = (arr, key) => {
      arr.forEach(item => {
        const empId = item.employee_id.toString();
        if (!resumeMap[empId]) {
          resumeMap[empId] = { experiences: [], educations: [], languageSkills: [], otherSkills: [] };
        }
        resumeMap[empId][key].push(item);
      });
    };

    addToResume(experiences, "experiences");
    addToResume(educations, "educations");
    addToResume(languageSkills, "languageSkills");
    addToResume(otherSkills, "otherSkills");

    return resumeMap; // Object keyed by employee_id
  } catch (err) {
    console.error("Error fetching all resumes:", err);
    throw err;
  }
};