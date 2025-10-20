import PublicHoliday from "../models/publicHoliday.js";

// 🟢 Add new holiday
export const addHoliday = async (req, res) => {
  try {
    const { date, description, company } = req.body;
    const holiday = new PublicHoliday({ date, description, company });
    await holiday.save();
    res.status(201).json(holiday);
  } catch (error) {
    console.error("Error adding holiday:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🟡 Get all holidays
export const getHolidays = async (req, res) => {
  try {
    const holidays = await PublicHoliday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    console.error("Error getting holidays:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔴 Delete holiday
export const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    await PublicHoliday.findByIdAndDelete(id);
    res.json({ message: "Holiday deleted successfully" });
  } catch (error) {
    console.error("Error deleting holiday:", error);
    res.status(500).json({ message: "Server error" });
  }
};
