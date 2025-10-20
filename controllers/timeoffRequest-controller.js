import TimeOffRequest from "../models/timeOffRequest.js";
import TimeOffBalance from "../models/timeOffBalance.js";
import Employee from "../models/Employee.js";
import { calculateNumberOfDays } from "../utils/calculatedays.js";
import PublicHoliday from "../models/publicHoliday.js";

// 🟢 Create a new time off request
export const createTimeOffRequest = async (req, res) => {
  try {
    const { employee_id, start_date, end_date, type } = req.body;
    console.log("Body received:", req.body);
    // get employee info
    const employee = await Employee.findById(employee_id);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // determine approver
    let approver_id = employee.manager_id;
    if (!approver_id && employee.job_position === "Manager") {
      // get admin approver
      const admin = await Employee.findOne({ job_position: "Admin" });
      if (!admin) return res.status(400).json({ message: "No admin found" });
      approver_id = admin._id;
    }

    // calculate number of business days (excluding weekends & holidays)
    const holidays = await PublicHoliday.find().select("date");
    const holidayDates = holidays.map(h => h.date);
    const number_of_days = calculateNumberOfDays(start_date, end_date, holidayDates);

    // check balance
    const balance = await TimeOffBalance.findOne({ employee_id, year: new Date().getFullYear() });
    if (!balance) return res.status(400).json({ message: "No balance found" });

    if (type === "Paid" && balance.paid_days < number_of_days) {
      return res.status(400).json({ message: "Insufficient paid leave balance" });
    }
    if (type === "Compensatory" && balance.compensatory_days < number_of_days) {
      return res.status(400).json({ message: "Insufficient compensatory leave balance" });
    }

    const newRequest = new TimeOffRequest({
      employee_id,
      approver_id,
      start_date,
      end_date,
      number_of_days,
      type
    });

    await newRequest.save();
    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating time off request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟡 Get all requests for admin or manager
export const getAllTimeOffRequests = async (req, res) => {
  try {
    const requests = await TimeOffRequest.find()
      .populate("employee_id", "full_name job_position")
      .populate("approver_id", "full_name job_position")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟡 Get requests by employee
export const getRequestsByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const requests = await TimeOffRequest.find({ employee_id: employeeId })
      .populate("approver_id", "full_name")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔴 Delete a request (only if still pending)
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
