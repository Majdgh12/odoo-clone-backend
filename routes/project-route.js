// routes/projectRoutes.js
import express from "express";
import * as projectController from "../controllers/project-controller.js";
import { requireAuth,isAdmin,isManagerOfDepartment,canEditProject } from "../middleware/permissions.js";

const router = express.Router();

// Only authenticated users can fetch projects
router.get("/",/* requireAuth,*/ projectController.getProjects);
//create project
router.post("/", /*requireAuth, isAdmin, isManagerOfDepartment,*/ projectController.createProject);
//update project
router.put("/:id", requireAuth, canEditProject, projectController.updateProject);
//delete project
router.delete("/:id",/* requireAuth,*/ projectController.deleteProject);
//assign team lead
router.put("/:id/assign-team-lead", /*requireAuth,*/ projectController.assignTeamLead);
// add members
// add members to project
router.post("/:id/members",  requireAuth,  projectController.addProjectMembers);
// remove member from project
router.delete("/:id/members/:memberId", requireAuth, projectController.removeProjectMember);
// Get project by ID (with tasks & members)
router.get("/:id", projectController.getProjectById);
//get projects by department
router.get("/department/:departmentId",/* requireAuth,*/ projectController.getProjectsByDepartment);
export default router;
