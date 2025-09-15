// routes/index.js
import express from 'express';
const router = express.Router();

// Import all route modules
const employeeRoutes = require('./employee-routes');
const departmentRoutes = require('./department-routes');
const privateInfoRoutes = require('./privateinfo-routes');
const resumeRoutes = require('./resume-routes');
const skillsRoutes = require('./skills-routes');
const workInfoRoutes = require('./workinfo-routes');
const employeeSettingsRoutes = require('./employeesettings-routes');

// Use the routes
router.use('/employees', employeeRoutes);
router.use('/departments', departmentRoutes);
router.use('/private-info', privateInfoRoutes);
router.use('/resume', resumeRoutes);
router.use('/skills', skillsRoutes);
router.use('/work-info', workInfoRoutes);
router.use('/employee-settings', employeeSettingsRoutes);

module.exports = router;