const express = require("express");
const {
	createTask,
	getAllUserTasks,
	updateTask,
	deleteTask,
} = require("../controllers/taskController");
const isAuthenticated = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", isAuthenticated, getAllUserTasks);
router.put("/update/:taskId", isAuthenticated, updateTask);
router.delete("/delete/:taskId", isAuthenticated, deleteTask);
router.post("/create", isAuthenticated, createTask);
module.exports = router;
