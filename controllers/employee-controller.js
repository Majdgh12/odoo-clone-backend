import Employee from "../models/Employee.js";
import mongoose from "mongoose";

/*getEmployees → Return all employees with full details (join Resume, Skills, WorkInfo, PrivateInfo, Settings).*/
export const getEmployees = async () => {
  try {
    return await Employee.aggregate([
          // Lookup Experiences
          {
            $lookup: {
              from: "experiences",
              localField: "_id",
              foreignField: "employee_id",
              as: "experience",
            },
          },
          // Lookup Educations
          {
            $lookup: {
              from: "educations",
              localField: "_id",
              foreignField: "employee_id",
              as: "education",
            },
          },
          // Lookup Programming Skills
          {
            $lookup: {
              from: "programmingskills",
              localField: "_id",
              foreignField: "employee_id",
              as: "programming_languages",
            },
          },
          // Lookup Language Skills
          {
            $lookup: {
              from: "languageskills",
              localField: "_id",
              foreignField: "employee_id",
              as: "language",
            },
          },
          // Lookup Other Skills
          {
            $lookup: {
              from: "otherskills",
              localField: "_id",
              foreignField: "employee_id",
              as: "other_skills",
            },
          },
          // Lookup WorkInfo
          {
            $lookup: {
              from: "workinfos",
              localField: "_id",
              foreignField: "employee_id",
              as: "workInfo",
            },
          },
          // Lookup PrivateInfo
          {
            $lookup: {
              from: "privatecontacts",
              localField: "_id",
              foreignField: "employee_id",
              as: "private_contact",
            },
          },
          {
            $lookup: {
              from: "emergencycontacts",
              localField: "_id",
              foreignField: "employee_id",
              as: "emergency",
            },
          },
          {
            $lookup: {
              from: "familystatuses",
              localField: "_id",
              foreignField: "employee_id",
              as: "family_status",
            },
          },
          {
            $lookup: {
              from: "educationprivates",
              localField: "_id",
              foreignField: "employee_id",
              as: "education_private",
            },
          },
          {
            $lookup: {
              from: "workpermits",
              localField: "_id",
              foreignField: "employee_id",
              as: "work_permit",
            },
          },
          // Lookup Settings
          {
            $lookup: {
              from: "employeesettings",
              localField: "_id",
              foreignField: "employee_id",
              as: "settings",
            },
          },
          // Populate Department
          {
            $lookup: {
              from: "departments",
              localField: "department_id",
              foreignField: "_id",
              as: "department",
            },
          },
          // Populate Manager
          {
            $lookup: {
              from: "employees",
              localField: "manager_id",
              foreignField: "_id",
              as: "manager",
            },
          },
          // Populate Coach
          {
            $lookup: {
              from: "employees",
              localField: "coach_id",
              foreignField: "_id",
              as: "coach",
            },
          },
          // Reshape output
          {
            $project: {
              _id: 1,
              user: {
                general_info: {
                  full_name: "$full_name",
                  status: "$status",
                  job_position: "$job_position",
                  work_email: "$work_email",
                  work_phone: "$work_phone",
                  work_mobile: "$work_mobile",
                  tags: "$tags",
                  company: "$company",
                  department: { $arrayElemAt: ["$department", 0] },
                  manager: { $arrayElemAt: ["$manager", 0] },
                  coach: { $arrayElemAt: ["$coach", 0] },
                  image: "$image",
                },
                general_resume: {
                  resume: {
                    experience: "$experience",
                    education: "$education",
                  },
                  skills: {
                    programming_languages: "$programming_languages",
                    language: "$language",
                    other_skills: "$other_skills",
                  },
                },
                work_info: { $arrayElemAt: ["$workInfo", 0] },
                private_info: {
                  private_contact: { $arrayElemAt: ["$private_contact", 0] },
                  emergency: { $arrayElemAt: ["$emergency", 0] },
                  family_status: { $arrayElemAt: ["$family_status", 0] },
                  education: { $arrayElemAt: ["$education_private", 0] },
                  work_permit: { $arrayElemAt: ["$work_permit", 0] },
                },
                settings: { $arrayElemAt: ["$settings", 0] },
              },
            },
          },
        ]);
  } catch (err) {
    console.error("Error fetching employees:", err);
    throw err;
  }
};

/*getEmployeeById → Return one employee with full details.*/
export const getEmployeeById = async (employeeId) => {
  try {

    const cleanedId = employeeId.trim();

    if (!mongoose.Types.ObjectId.isValid(cleanedId)) {
      throw new Error("Invalid employee ID");
    }

    const [employee] = await Employee.aggregate([
      // Match employee by ID
      { $match: { _id: new mongoose.Types.ObjectId(cleanedId) } },

      // Lookup Experiences
      {
        $lookup: {
          from: "experiences",
          localField: "_id",
          foreignField: "employee_id",
          as: "experience",
        },
      },
      // Lookup Educations
      {
        $lookup: {
          from: "educations",
          localField: "_id",
          foreignField: "employee_id",
          as: "education",
        },
      },
      // Lookup Programming Skills
      {
        $lookup: {
          from: "programmingskills",
          localField: "_id",
          foreignField: "employee_id",
          as: "programming_languages",
        },
      },
      // Lookup Language Skills
      {
        $lookup: {
          from: "languageskills",
          localField: "_id",
          foreignField: "employee_id",
          as: "language",
        },
      },
      // Lookup Other Skills
      {
        $lookup: {
          from: "otherskills",
          localField: "_id",
          foreignField: "employee_id",
          as: "other_skills",
        },
      },
      // Lookup WorkInfo
      {
        $lookup: {
          from: "workinfos",
          localField: "_id",
          foreignField: "employee_id",
          as: "workInfo",
        },
      },
      // Lookup Private Info (sub-collections)
      {
        $lookup: {
          from: "privatecontacts",
          localField: "_id",
          foreignField: "employee_id",
          as: "private_contact",
        },
      },
      {
        $lookup: {
          from: "emergencycontacts",
          localField: "_id",
          foreignField: "employee_id",
          as: "emergency",
        },
      },
      {
        $lookup: {
          from: "familystatuses",
          localField: "_id",
          foreignField: "employee_id",
          as: "family_status",
        },
      },
      {
        $lookup: {
          from: "educationprivates",
          localField: "_id",
          foreignField: "employee_id",
          as: "education_private",
        },
      },
      {
        $lookup: {
          from: "workpermits",
          localField: "_id",
          foreignField: "employee_id",
          as: "work_permit",
        },
      },
      // Lookup Settings
      {
        $lookup: {
          from: "employeesettings",
          localField: "_id",
          foreignField: "employee_id",
          as: "settings",
        },
      },
      // Populate Department
      {
        $lookup: {
          from: "departments",
          localField: "department_id",
          foreignField: "_id",
          as: "department",
        },
      },
      // Populate Manager
      {
        $lookup: {
          from: "employees",
          localField: "manager_id",
          foreignField: "_id",
          as: "manager",
        },
      },
      // Populate Coach
      {
        $lookup: {
          from: "employees",
          localField: "coach_id",
          foreignField: "_id",
          as: "coach",
        },
      },
      // Reshape output (same as getEmployees)
      {
        $project: {
          _id: 1,
          user: {
            general_info: {
              full_name: "$full_name",
              status: "$status",
              job_position: "$job_position",
              work_email: "$work_email",
              work_phone: "$work_phone",
              work_mobile: "$work_mobile",
              tags: "$tags",
              company: "$company",
              department: { $arrayElemAt: ["$department", 0] },
              manager: { $arrayElemAt: ["$manager", 0] },
              coach: { $arrayElemAt: ["$coach", 0] },
              image: "$image",
            },
            general_resume: {
              resume: {
                experience: "$experience",
                education: "$education",
              },
              skills: {
                programming_languages: "$programming_languages",
                language: "$language",
                other_skills: "$other_skills",
              },
            },
            work_info: { $arrayElemAt: ["$workInfo", 0] },
            private_info: {
              private_contact: { $arrayElemAt: ["$private_contact", 0] },
              emergency: { $arrayElemAt: ["$emergency", 0] },
              family_status: { $arrayElemAt: ["$family_status", 0] },
              education: { $arrayElemAt: ["$education_private", 0] },
              work_permit: { $arrayElemAt: ["$work_permit", 0] },
            },
            settings: { $arrayElemAt: ["$settings", 0] },
          },
        },
      },
    ]);

// sourcery skip: use-braces
    if (!employee) throw new Error("Employee not found");
    return employee;
  } catch (err) {
    console.error("Error fetching employee:", err);
    throw err;
  }
};

/*searchEmployees → Search employees by name, department, position, or tags.*/
export const searchEmployees = async (searchTerm) => {
  try {
    const regex = new RegExp(searchTerm, "i"); // case-insensitive search

// sourcery skip: inline-immediately-returned-variable
    const employees = await Employee.aggregate([
      // Join with departments
      {
        $lookup: {
          from: "departments",
          localField: "department_id",
          foreignField: "_id",
          as: "department",
        },
      },
      // Flatten department array
      {
        $addFields: {
          department: { $arrayElemAt: ["$department", 0] },
        },
      },
      // Match search term
      {
        $match: {
          $or: [
            { full_name: regex },
            { job_position: regex },
            { tags: regex },
            { "department.name": regex },
          ],
        },
      },
    ]);

    return employees;
  } catch (err) {
    console.error("Error searching employees:", err);
    throw err;
  }
};

/*getEmployeesPage → Return employees with pagination (limit, skip).*/

export const getEmployeesPage = async (page = 1, limit = 10) => {
  try {
    // Calculate how many documents to skip
    const skip = (page - 1) * limit;

    // Get total count of employees
    const total = await Employee.countDocuments();

    // Get employees with pagination
    const employees = await Employee.aggregate([
      { $skip: skip }, // skip previous pages
      { $limit: limit }, // limit results per page
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      employees,
    };
  } catch (err) {
    console.error("Error fetching paginated employees:", err);
    throw err;
  }
};
/*getEmployeesByDepartment → Filter employees by department.*/
export const getEmployeesByDepartment = async (departmentId) => {
  try {
    // Ensure departmentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      throw new Error("Invalid department ID");
    }

    const employees = await Employee.find({
      department_id: new mongoose.Types.ObjectId(departmentId),
    });

    return employees;
  } catch (err) {
    console.error("Error fetching employees by department:", err);
    throw err;
  }
};
/*getEmployeesByPosition → Filter employees by job position.*/
export const getEmployeesByPosition = async (position) => {
  try {
    // Use regex for case-insensitive partial match
    const regex = new RegExp(position, "i");

    const employees = await Employee.find({
      job_position: regex,
    });

    return employees;
  } catch (err) {
    console.error("Error fetching employees by position:", err);
    throw err;
  }
};
/*getEmployeesByTags → Filter employees by one or multiple tags.*/
export const getEmployeesByTags = async (tags) => {
  try {
    // Ensure tags is an array
    const tagsArray = Array.isArray(tags) ? tags : [tags];

    // Use case-insensitive regex for each tag
    const regexTags = tagsArray.map((tag) => new RegExp(tag, "i"));

    const employees = await Employee.find({
      // $in checks if any element in tags array matches
      tags: { $in: regexTags },
    });

    return employees;
  } catch (err) {
    console.error("Error fetching employees by tags:", err);
    throw err;
  }
};
/*getEmployeeStats → Return statistics (e.g., number of employees per department, per position).*/
export const getEmployeeStats = async () => {
  try {
    const stats = {};

    //  Number of employees per department
    const byDepartment = await Employee.aggregate([
      {
        $group: {
          _id: "$department_id", // group by department_id
          count: { $sum: 1 }, // count employees
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "_id",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: "$department" },
      {
        $project: {
          _id: 0,
          department: "$department.name",
          count: 1,
        },
      },
    ]);

    stats.byDepartment = byDepartment;

    //  Number of employees per position
    const byPosition = await Employee.aggregate([
      {
        $group: {
          _id: "$job_position",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          job_position: "$_id",
          count: 1,
        },
      },
    ]);

    stats.byPosition = byPosition;

    return stats;
  } catch (err) {
    console.error("Error fetching employee stats:", err);
    throw err;
  }
};
/*filterEmployees → Advanced filter combining multiple conditions (department + position + skills).*/
export const filterEmployees = async ({ departmentId, position, skills }) => {
  try {
    const matchConditions = {};

    // 1️⃣ Filter by department
    if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
      matchConditions.department_id = new mongoose.Types.ObjectId(departmentId);
    }

    // 2️⃣ Filter by position (case-insensitive)
    if (position) {
      matchConditions.job_position = { $regex: position, $options: "i" };
    }

    // 3️⃣ Filter by skills (skills is an array of skill names)
    if (skills && Array.isArray(skills) && skills.length > 0) {
      matchConditions.skills = { $all: skills };
      // $all ensures employee has **all** the listed skills
    }

    const employees = await Employee.aggregate([
      // Lookup skills if filtering by skills
      ...(skills && skills.length > 0
        ? [
            {
              $lookup: {
                from: "skills",
                localField: "_id",
                foreignField: "employee_id",
                as: "skills",
              },
            },
          ]
        : []),

      // Flatten skills if needed
      ...(skills && skills.length > 0
        ? [
            {
              $addFields: {
                skillNames: "$skills.name",
              },
            },
          ]
        : []),

      // Apply match conditions
      {
        $match: {
          ...matchConditions,
          ...(skills && skills.length > 0
            ? { skillNames: { $all: skills } }
            : {}),
        },
      },
    ]);

    return employees;
  } catch (err) {
    console.error("Error filtering employees:", err);
    throw err;
  }
};
