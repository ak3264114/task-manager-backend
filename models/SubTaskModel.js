const mongoose = require('mongoose');

const subTaskSchema = new mongoose.Schema({
    task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    title: { type: String, required: true },
    status: { type: Number, enum: [0, 1], default: 0 }, 
    deleted_at: { type: Date, default: null },
}, { timestamps: true });

const SubTask = mongoose.model('SubTask', subTaskSchema);

module.exports = SubTask;