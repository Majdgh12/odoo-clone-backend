import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import employeeRoutes from "./routes/employee-routes.js";
import departmentRoutes from "./routes/department-routes.js";
import privateInfoRoutes from "./routes/privateinfo-routes.js";
import resumeRoutes from "./routes/resume-routes.js";
import skillsRoutes from "./routes/skills-routes.js";
import workInfoRoutes from "./routes/workinfo-routes.js";
import employeeSettingsRoutes from "./routes/employeesettings-routes.js";
import authRoutes from "./routes/authRoutes.js";
import path from "path";
import projectRoutes from "./routes/project-route.js";
import taskRoutes from "./routes/task-route.js";
import timeoff from "./routes/timeoff.js";
// Load environment variables
dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({ origin: "http://localhost:3000" })); // your Next.js app

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Mount routes
app.use("/api/employees", employeeRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/private-info", privateInfoRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/work-info", workInfoRoutes);
app.use("/api/employee-settings", employeeSettingsRoutes);
app.use("/api/auth", authRoutes);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/timeoff", timeoff);
// Add error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Internal server error" });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});


// Add other routes as needed

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));