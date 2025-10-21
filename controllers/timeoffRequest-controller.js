import TimeOffRequest from "../models/timeOffRequest.js";
import TimeOffBalance from "../models/timeOffBalance.js";
import Employee from "../models/Employee.js";
import { calculateNumberOfDays } from "../utils/calculatedays.js";
import PublicHoliday from "../models/publicHoliday.js";
import User from "../models/user.js";

// Helper mapper
const mapRequest = (r, scope = null) => ({
  _id: r._id,
  type: r.type,
  startDate: r.start_date,
  endDate: r.end_date,
  numberOfDays: r.number_of_days,
  status: r.status,
  employeeId: r.employee_id?._id,
  employeeName: r.employee_id?.full_name || "Unknown",
  approvedBy: r.approver_id?.full_name || null,
  scope,
});

// 🟢 Create a new time off request
export const createTimeOffRequest = async (req, res) => {
  try {
    const { employee_id, start_date, end_date, type } = req.body;

    const employee = await Employee.findById(employee_id).populate("manager_id");
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // determine approver → manager of department, or admin if employee is manager
    let approver_id = employee.manager_id?._id;
    if (!approver_id && employee.job_position?.toLowerCase() === "manager") {
      const admin = await Employee.findOne({ job_position: "Admin" });
      if (!admin) return res.status(400).json({ message: "No admin found" });
      approver_id = admin._id;
    }

    // calculate days excluding weekends + holidays
    const holidays = await PublicHoliday.find().select("date");
    const holidayDates = holidays.map(h => h.date);
    const number_of_days = calculateNumberOfDays(start_date, end_date, holidayDates);

    // check balance
    const balance = await TimeOffBalance.findOne({
      employee_id,
      year: new Date().getFullYear(),
    });
    if (!balance) return res.status(400).json({ message: "No balance found" });

    if (type === "Paid" && balance.paid_days < number_of_days) {
      return res.status(400).json({ message: "Insufficient paid leave balance" });
    }
    if (type === "Compensatory" && balance.compensatory_days < number_of_days) {
      return res.status(400).json({ message: "Insufficient compensatory leave balance" });
    }

    // create request
    const newRequest = new TimeOffRequest({
      employee_id,
      approver_id,
      start_date,
      end_date,
      number_of_days,
      type,
    });
    await newRequest.save();

    const populated = await TimeOffRequest.findById(newRequest._id)
      .populate("employee_id", "full_name department")
      .populate("approver_id", "full_name");

    res.status(201).json(mapRequest(populated));
  } catch (error) {
    console.error("Error creating time off request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟡 Get requests (admin sees all, manager sees only their department)
export const getAllTimeOffRequests = async (req, res) => {
  try {
    const { role, managerId } = req.query; // role comes from query, managerId from session

    let filter = {};
    if (role === "manager" && managerId) {
      // manager → only requests assigned to them
      filter.approver_id = managerId;
    }

    const requests = await TimeOffRequest.find(filter)
      .populate("employee_id", "full_name department")
      .populate("approver_id", "full_name")
      .sort({ createdAt: -1 });

    res.json(requests.map(r => mapRequest(r, role === "manager" ? "department" : null)));
  } catch (err) {
    console.error("Error in getAllTimeOffRequests:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟡 Manager-only: Department requests
export const getDepartmentRequests = async (req, res) => {
  try {
    const { managerId } = req.params;

    // Only requests where this manager is approver
    const reqs = await TimeOffRequest.find({ approver_id: managerId })
      .populate("employee_id", "full_name department")
      .populate("approver_id", "full_name")
      .sort({ createdAt: -1 });

    res.json(reqs.map(r => mapRequest(r, "department")));
  } catch (error) {
    console.error("Error fetching department requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟡 Get requests by employee (for their own view)
export const getRequestsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const requests = await TimeOffRequest.find({ employee_id: employeeId })
      .populate("employee_id", "full_name")
      .populate("approver_id", "full_name")
      .sort({ createdAt: -1 });

    res.json(requests.map(r => mapRequest(r, "own")));
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await TimeOffRequest.findById(id);

    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "Pending") {
      return res.status(400).json({ message: "Only pending requests can be deleted" });
    }

    await TimeOffRequest.findByIdAndDelete(id);
    res.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Error deleting request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

