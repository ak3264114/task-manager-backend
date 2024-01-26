const express = require('express');
const isAuthenticated = require('../middlewares/authMiddleware');
const { createSubTask, getAllUserSubTasks, updateSubTask, deleteSubTask } = require('../controllers/subTaskController');

const router = express.Router();

router.get('/', isAuthenticated, getAllUserSubTasks);
router.put('/update/:subTaskId', isAuthenticated, updateSubTask);
router.delete('/delete/:subTaskId', isAuthenticated, deleteSubTask);
router.post('/create-subtask', isAuthenticated , createSubTask);

module.exports = router;
