// routes/taskRoutes.js
import express from "express";
import * as taskController from "../controllers/task-controller.js";
import {  } from "../middleware/permissions.js";

const router = express.Router();

router.get("/", taskController.getTasks);
router.post("/",  taskController.createTask);
router.get("/:id",  taskController.getTaskById);
router.put("/:id",  taskController.updateTask);
router.delete("/:id",  taskController.deleteTask);
router.post("/:id/comments", taskController.addComment);

export default router;
