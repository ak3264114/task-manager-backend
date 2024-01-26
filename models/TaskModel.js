const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		description: { type: String, required: true },
		dueDate: { type: Date },
		priority: { type: Number, default: 0 },
		status: {
			type: String,
			enum: ["TODO", "IN_PROGRESS", "DONE"],
			default: "TODO",
		},
		deleted_at: { type: Date, default: null },
	},
	{ timestamps: true },
);

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
