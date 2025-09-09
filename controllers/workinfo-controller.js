import WorkInfo from "../models/workInfo.js";

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