import Employee from "../models/Employee.js";
import mongoose from "mongoose";
import User from "../models/user.js";

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

//create employee
// Fixed createEmployee function with proper error handling
export const createEmployee = async (employeeData) => {
  console.log("🚀 CONTROLLER: createEmployee called");
  console.log("🔍 CONTROLLER: employeeData received:", employeeData);
  console.log("🔍 CONTROLLER: employeeData type:", typeof employeeData);

  try {
    // The issue was here - you were trying to access employeeData.status
    // but employeeData might be undefined or not have the status property

    if (!employeeData) {
      throw new Error("Employee data is required");
    }

    // Validate required fields
    if (
      !employeeData.full_name ||
      !employeeData.work_email
      
    ) {
      throw new Error(
        "Missing required fields: full_name, work_email, or department_id"
      );
    }

    // Process the employee data with safe property access
    const processedData = {
      full_name: employeeData.full_name,
      job_position: employeeData.job_position || "",
      work_email: employeeData.work_email,
      work_phone: employeeData.work_phone || "",
      work_mobile: employeeData.work_mobile || "",
      company: employeeData.company || "",
      tags: Array.isArray(employeeData.tags) ? employeeData.tags : [],
      department_id: employeeData.department_id || null,
      manager_id:
        employeeData.manager_id === "null" || !employeeData.manager_id
          ? null
          : employeeData.manager_id,
      coach_id:
        employeeData.coach_id === "null" || !employeeData.coach_id
          ? null
          : employeeData.coach_id,
      status: employeeData.status || "offline", // This was the problematic line - now with fallback
    };

    console.log("✅ CONTROLLER: Processed employee data:", processedData);

    // Create the employee
    const employee = new Employee(processedData);
    const savedEmployee = await employee.save();

    console.log("✅ CONTROLLER: Employee saved successfully:", savedEmployee);

    return {
      message: "Employee created successfully",
      employee: savedEmployee,
    };
  } catch (error) {
    console.error("❌ CONTROLLER ERROR in createEmployee:", error);
    console.error("❌ CONTROLLER ERROR message:", error.message);
    console.error("❌ CONTROLLER ERROR stack:", error.stack);

    // Re-throw the error so the route can handle it
    throw new Error(error.message || "Failed to create employee");
  }
};

// UPDATE Employee details
export const updateEmployee = async (id, data) => {
  if (!data.status) {
    data.status = "offline";
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid employee ID");
  }
  const employee = await Employee.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!employee) throw new Error("Employee not found");
  return employee;
};

// DELETE Employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.json({ message: "Employee deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// UPDATE Employee role (admin, manager, team_lead, employee)
export const updateEmployeeRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "manager", "team_lead", "employee"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Find the user linked to this employee
    const user = await User.findOne({ employee: req.params.id });
    if (!user)
      return res
        .status(404)
        .json({ message: "User not found for this employee" });

    user.role = role;
    await user.save();

    res.json({ message: "Role updated successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Assign employee to a team lead
export const assignEmployeeToTeamLead = async (req, res) => {
  try {
    const { teamLeadId } = req.body;
    const { id: employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teamLeadId)) {
      return res.status(400).json({ message: "Invalid team lead ID" });
    }

    // Verify team lead exists and has correct role
    const teamLead = await User.findById(teamLeadId).populate("employee");
    if (!teamLead || teamLead.role !== "team_lead") {
      return res
        .status(400)
        .json({ message: "Provided user is not a team lead" });
    }

    // Update employee with team lead reference
    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      { team_lead_id: teamLead.employee._id },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Employee assigned to team lead", employee });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
