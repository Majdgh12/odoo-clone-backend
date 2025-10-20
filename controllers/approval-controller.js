import TimeOffRequest from "../models/timeOffRequest.js";
import TimeOffBalance from "../models/timeOffBalance.js";

// 🟢 Approve request
export const approveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const approver_id = req.user._id; // assuming JWT middleware

    const request = await TimeOffRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "Pending") return res.status(400).json({ message: "Request already processed" });

    request.status = "Approved";
    request.approved_at = new Date();
    request.approver_id = approver_id;
    await request.save();

    // Deduct balance
    const balance = await TimeOffBalance.findOne({ employee_id: request.employee_id, year: new Date().getFullYear() });
    if (request.type === "Paid") balance.paid_days -= request.number_of_days;
    if (request.type === "Compensatory") balance.compensatory_days -= request.number_of_days;
    if (request.type === "Sick") balance.sick_days -= request.number_of_days;
    await balance.save();

    res.json({ message: "Request approved successfully", request });
  } catch (error) {
    console.error("Error approving request:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔴 Reject request
export const rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const approver_id = req.user._id;

    const request = await TimeOffRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    if (request.status !== "Pending") return res.status(400).json({ message: "Request already processed" });

    request.status = "Rejected";
    request.approved_at = new Date();
    request.approver_id = approver_id;
    request.comment = comment || "";
    await request.save();

    res.json({ message: "Request rejected", request });
  } catch (error) {
    console.error("Error rejecting request:", error);
    res.status(500).json({ message: "Server error" });
  }
};
