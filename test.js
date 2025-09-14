import mongoose from "mongoose";
import Employee from "./models/Employee.js"; // adjust path

const MONGO_URI = "mongodb+srv://hr_app_user:zoSTeF8tXGbgBulk@cluster0.elyy2t1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const test = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const employees = await Employee.find({});
    console.log("All employees:", employees);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

test();
