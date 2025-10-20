import mongoose from "mongoose";

const publicHolidaySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true }
  },
  { timestamps: true }
);

const PublicHoliday = mongoose.model("PublicHoliday", publicHolidaySchema);
export default PublicHoliday;
