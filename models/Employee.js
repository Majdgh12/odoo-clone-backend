import { tr } from "@faker-js/faker";
import { number } from "mathjs";
import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  full_name: { type: String,
     required: true,
    trim: true,
    minlength: 2,
    maxlength: 50 },
  status: { type: String, enum: ["online", "offline"], default: "offline" },
  job_position: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100,
  },
  work_email: { 
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        // Comprehensive email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },
      message: "Please enter a valid email" // Match your exact error message
    }
  },

  work_phone: { 
    type: Number,
    validate: {
      validator: function(v) {
        return v === null || (v && v.toString().length >= 7);
      },
      message: props => `${props.value} is not a valid phone number!`
    },
  },

  work_mobile: { 
    type: Number,
    validate: {
      validator: function(v) {
        return v === null || (v && v.toString().length >= 7);
      },
      message: props => `${props.value} is not a valid mobile number!`
    },
  },_location: { type: String, trim: true, maxlength: 100 },
  work_location_type: { type: String, enum: ["onsite", "remote", "hybrid"], default: "onsite" },
  work_time_zone: { type: String, trim: true, maxlength: 50 },
  work_shift: { type: String, trim: true, maxlength: 50 },
  start_date: { type: Date },
  end_date: { type: Date, default: null },
  bio: { type: String, trim: true, maxlength: 500 },
  image: String,
  tags: [String],
  company: {
    type: String,
    trim: true,
    maxlength: 30,

  },

  department_id: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  manager_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // direct manager
  team_lead_id: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // NEW: for team lead link
  
  
}
, { timestamps: true }
  );

const Employee = mongoose.model("Employee", employeeSchema);
export default Employee;
