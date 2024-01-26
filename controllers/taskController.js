const SubTask = require("../models/SubTaskModel");
const Task = require("../models/TaskModel");
const { calculatePriority } = require("../utils/helper");
const { errorResponse, successResponse } = require("../utils/responseUtil");

exports.createTask = async (req, res) => {
	try {
		const { title, description, dueDate } = req.body;

		if (!title || !description || !dueDate) {
			return errorResponse(
				res,
				400,
				"Title, description, and due date are required.",
			);
		}

		const task = new Task({
			title,
			description,
			dueDate,
			priority: calculatePriority(dueDate),
			status: "TODO",
		});
		await task.save();

		return successResponse(res, 200, "Task created successfully", task);
	} catch (error) {
		console.error("Error creating task:", error);
		return errorResponse(res, 500, "Internal Server Error");
	}
};

exports.getAllUserTasks = async (req, res) => {
	try {
		const { priority, dueDate, page = 1, limit = 10 } = req.query;

		const filter = {deleted_at : null};
		if (priority !== undefined) {
			filter.priority = priority;
		}
		if (dueDate !== undefined) {
			filter.dueDate = dueDate;
		}

		const totalTasks = await Task.countDocuments(filter);
		const tasks = await Task.find(filter)
			.sort({ dueDate: "asc" })
			.skip((page - 1) * limit)
			.limit(Number(limit));

		const totalPages = Math.ceil(totalTasks / limit);
		const isNext = page < totalPages;

		const paginationInfo = {
			currentPage: page,
			totalPages,
			totalItems: totalTasks,
			isNext,
		};

		return successResponse(res, 200, "User tasks retrieved successfully", {
			tasks,
			...paginationInfo,
		});
	} catch (error) {
		console.error("Error getting user tasks:", error);
		return errorResponse(res, 500, "Internal Server Error");
	}
};

exports.updateTask = async (req, res) => {
	try {
	  const { taskId } = req.params;
	  const { dueDate, status } = req.body;
  
	  if (!taskId) {
		return errorResponse(res, 400, "Task ID is required for updating a task");
	  }
  
	  const task = await Task.findById(taskId);
  
	  if (!task || task?.deleted_at) {
		return errorResponse(res, 404, "Task not found");
	  }
  
	  const updates = {};
	  if (dueDate !== undefined) {
		updates.dueDate = dueDate;
		const newPriority = calculatePriority(dueDate);
		updates.priority = newPriority;
	  }
	  else{
		const newPriority = calculatePriority(task.dueDate);
		updates.priority = newPriority;
	  }
  
	  if (status !== undefined) {
		updates.status = status;
	  }
  
	  const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
		new: true,
	  }); 
  
	  return successResponse(res, 200, "Task updated successfully", updatedTask);
	} catch (error) {
	  console.error("Error updating task:", error);
	  return errorResponse(res, 500, "Internal Server Error");
	}
  };
  

const updateSubTasksStatus = async (taskId, taskStatus) => {
	const subtasks = await SubTask.find({ task_id: taskId });
	for (const subtask of subtasks) {
		subtask.status = taskStatus === "DONE" ? 1 : 0;
		await subtask.save();
	}
};

exports.deleteTask = async (req, res) => {
	try {
		const { taskId } = req.params;
		const task = await Task.find({ _id: taskId, deleted_at: null });
		if (!task.length) {
			return errorResponse(res, 404, "Task not found");
		}
		const deletedTask = await Task.findOneAndUpdate(
			{ _id: taskId },
			{ $set: { deleted_at: new Date() } },
		);

		await SubTask.updateMany(
			{ task_id: taskId },
			{ $set: { deleted_at: new Date() } },
		);
		return successResponse(res, 200, "Task deleted successfully");
	} catch (error) {
		console.error("Error deleting task:", error);
		return errorResponse(res, 500, "Internal Server Error");
	}
};
