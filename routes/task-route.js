// routes/taskRoutes.js
import express from "express";
import * as taskController from "../controllers/task-controller.js";
import { requireAuth } from "../middleware/permissions.js";

const router = express.Router();

router.get("/",/* requireAuth,*/ taskController.getTasks);
router.post("/", requireAuth, taskController.createTask);
router.get("/:id", requireAuth, taskController.getTaskById);
router.put("/:id", requireAuth, taskController.updateTask);
router.delete("/:id", requireAuth, taskController.deleteTask);
router.post("/:id/comments", requireAuth, taskController.addComment);

export default router;
