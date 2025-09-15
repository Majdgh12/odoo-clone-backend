import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/user.js";
import Employee from "./models/Employee.js";

const run = async () => {
  await mongoose.connect(
    "mongodb+srv://hr_app_user:zoSTeF8tXGbgBulk@cluster0.elyy2t1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  );

  const users = [
    { email: "admin@example.com", password: "admin123", role: "admin", employeeName: "Admin User" },
    { email: "manager@example.com", password: "manager123", role: "manager", employeeName: "Manager User" },
    { email: "teamlead@example.com", password: "teamlead123", role: "team_lead", employeeName: "Team Lead User" },
    { email: "employee@example.com", password: "employee123", role: "employee", employeeName: "Employee User" },
  ];

  for (const u of users) {
    let user = await User.findOne({ email: u.email });
    
    if (!user) {
      // create employee first
      const employee = await Employee.create({
        full_name: u.employeeName,
        job_position: u.role,
        status: "offline",
      });

      const passwordHash = await bcrypt.hash(u.password, 10);

      // create user
      user = await User.create({
        email: u.email,
        passwordHash,
        role: u.role,
        employee: employee._id,
      });

      console.log("Created user:", u.email);
    } else {
      // user exists → just update password
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.updateOne({ email: u.email }, { $set: { passwordHash: passwordHash, role: u.role } });
      console.log("Updated password and role for:", u.email);
    }
  }

  mongoose.disconnect();
};

run();
