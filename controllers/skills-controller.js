// Handles skills data.
// Functions:

import mongoose from "mongoose";
import Employee from "../models/Employee.js";

// getEmployeeSkills → Return skills for a specific employee (using aggregate)
export const getEmployeeSkills = async (req, res) => {
  try {
    const { id } = req.params;

    const employeeSkills = await Employee.aggregate([
      // Match the employee
      {
        $match: { _id: new mongoose.Types.ObjectId(id) }
      },
      // Lookup language skills
      {
        $lookup: {
          from: "languageskills",
          localField: "_id",
          foreignField: "employee_id",
          as: "language_skills"
        }
      },
      // Lookup other skills
      {
        $lookup: {
          from: "otherskills",
          localField: "_id",
          foreignField: "employee_id",
          as: "other_skills"
        }
      },
      // Lookup programming skills
      {
        $lookup: {
          from: "programmingskills",
          localField: "_id",
          foreignField: "employee_id",
          as: "programming_skills"
        }
      },
      // Optionally project only what you want
      {
        $project: {
          _id: 1,
          full_name: 1,
          job_position: 1,
          language_skills: 1,
          other_skills: 1,
          programming_skills: 1
        }
      }
    ]);

    res.status(200).json(employeeSkills[0] || {});
  } catch (error) {
    res.status(500).json({ message: "Error fetching employee skills", error });
  }
};

// getAllSkills → Return all skills across employees.
export const getAllSkills = async (req, res) => {
  try {
    const allSkills = await Employee.aggregate([
      // Lookup language skills
      {
        $lookup: {
          from: "languageskills",
          localField: "_id",
          foreignField: "employee_id",
          as: "language_skills"
        }
      },
      // Lookup other skills
      {
        $lookup: {
          from: "otherskills",
          localField: "_id",
          foreignField: "employee_id",
          as: "other_skills"
        }
      },
      // Lookup programming skills
      {
        $lookup: {
          from: "programmingskills",
          localField: "_id",
          foreignField: "employee_id",
          as: "programming_skills"
        }
      },
      // Keep only relevant fields
      {
        $project: {
          _id: 1,
          full_name: 1,
          job_position: 1,
          language_skills: 1,
          other_skills: 1,
          programming_skills: 1
        }
      }
    ]);

    res.status(200).json(allSkills);
  } catch (error) {
    res.status(500).json({ message: "Error fetching all skills", error });
  }
};

// getEmployeesBySkill → Return employees that have a specific skill.
export const getEmployeesBySkill = async (req, res) => {
  try {
    const { skill } = req.query; // e.g., /employees/skills?skill=JavaScript
    if (!skill) {
      return res.status(400).json({ message: "Skill query parameter is required" });
    }

    const regex = new RegExp(skill, "i"); // case-insensitive match

    const employees = await Employee.aggregate([
      // Lookup all skills
      {
        $lookup: {
          from: "languageskills",
          localField: "_id",
          foreignField: "employee_id",
          as: "language_skills"
        }
      },
      {
        $lookup: {
          from: "otherskills",
          localField: "_id",
          foreignField: "employee_id",
          as: "other_skills"
        }
      },
      {
        $lookup: {
          from: "programmingskills",
          localField: "_id",
          foreignField: "employee_id",
          as: "programming_skills"
        }
      },
      // Filter employees who have the skill in any of the skill arrays
      {
        $match: {
          $or: [
            { "language_skills.language_name": regex },
            { "other_skills.skill_name": regex },
            { "programming_skills.name": regex }
          ]
        }
      },
      // Project the fields you want
      {
        $project: {
          _id: 1,
          full_name: 1,
          job_position: 1,
          language_skills: 1,
          other_skills: 1,
          programming_skills: 1
        }
      }
    ]);

    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Error fetching employees by skill", error });
  }
};