// controllers/authController.js
import User from "../models/user.js";
import Employee from "../models/Employee.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt for email:", email);

    // Check if user exists
    const user = await User.findOne({ email }).populate("employee");
    if (!user) {
      console.log("User not found for email:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    console.log("User found:", user.email, "ID:", user._id);

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      console.log("Password mismatch for user:", user.email);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    console.log("Password matched for user:", user.email);

    // Create JWT payload
    const payload = {
      userId: user._id,
      role: user.role,
      departmentId: user.employee?.department_id || null,
      employeeId: user.employee?._id || null, // optional, useful for frontend checks
    };
    console.log("JWT payload:", payload);

    // Sign JWT
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });
    console.log("JWT token created for user:", user.email);

    // Send response
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
    });

    console.log("Login successful response sent for user:", user.email);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
