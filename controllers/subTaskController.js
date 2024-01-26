const SubTask = require("../models/SubTaskModel");
const Task = require("../models/TaskModel");
const { errorResponse, successResponse } = require("../utils/responseUtil");

exports.createSubTask = async (req, res) => {
	try {
		const { task_id, title } = req.body;

		if (!task_id || !title) {
			return errorResponse(
				res,
				400,
				"Task ID and title are required for creating a subtask",
			);
		}

		const parentTask = await Task.findById(task_id);
		if (!parentTask || parentTask.deleted_at) {
			return errorResponse(res, 404, "Parent task not found");
		}
		
		const subTask = new SubTask({
			task_id,
			title,
			status: 0,
		});
		await subTask.save();
		return successResponse(res, 200, "Subtask created successfully", subTask);
	} catch (error) {
		return errorResponse(res, 500, "Internal Server Error");
	}
};

exports.getAllUserSubTasks = async (req, res) => {
	try {
		const { task_id } = req.query;
		const filter = { deleted_at: null };
		if (task_id !== undefined) {
			filter.task_id = task_id;
		}
		const subtasks = await SubTask.find(filter);
		return successResponse(
			res,
			200,
			"User subtasks retrieved successfully",
			subtasks,
		);
	} catch (error) {
		console.error("Error getting user subtasks:", error);
		return errorResponse(res, 500, "Internal Server Error");
	}
};

exports.updateSubTask = async (req, res) => {
	try {
		const subTaskId = req.params.subTaskId;
		const { status } = req.body;

		if (!subTaskId || (status !== 0 && status !== 1)) {
			return errorResponse(
				res,
				400,
				"Invalid input for updating subtask status",
			);
		}
		const subTask = await SubTask.findById(subTaskId);
		if (!subTask || subTask.deleted_at) {
			return errorResponse(res, 404, "Subtask not found");
		}
		subTask.status = status;
		await subTask.save();
		await updateParentTaskStatus(subTask.task_id);

		return successResponse(
			res,
			200,
			"Subtask status updated successfully",
			subTask,
		);
	} catch (error) {
		console.error("Error updating subtask status:", error);
		return errorResponse(res, 500, "Internal Server Error");
	}
};

const updateParentTaskStatus = async (taskId) => {
	const subtasks = await SubTask.find({ task_id: taskId });
	const isAnySubtaskInProgress = subtasks.some(
		(subtask) => subtask.status === 1,
	);
	const parentTask = await Task.findById(taskId);
	if (parentTask) {
		if (isAnySubtaskInProgress) {
			parentTask.status = "IN_PROGRESS";
		} else if (subtasks.every((subtask) => subtask.status === 1)) {
			parentTask.status = "DONE";
		} else {
			parentTask.status = "TODO";
		}

		await parentTask.save();
	}
};

exports.deleteSubTask = async (req, res) => {
	try {
		const { subTaskId } = req.params;
		const subTask = await SubTask.find({ _id: subTaskId, deleted_at: null });

		if (!subTask.length) {
			return errorResponse(res, 404, "Subtask not found");
		}

		const deletedSubTask = await SubTask.findOneAndUpdate(
			{ _id: subTaskId },
			{ $set: { deleted_at: new Date() } },
		);

		return successResponse(res, 200, "Subtask deleted successfully");
	} catch (error) {
		console.error("Error deleting subtask:", error);
		return errorResponse(res, 500, "Internal Server Error");
	}
};
