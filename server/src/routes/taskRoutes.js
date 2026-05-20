const express = require('express');
const { body } = require('express-validator');
const {
  createTask,
  getTasksByProject,
  getMyTasks,
  getAllTasks,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

// dashboard stats
router.get('/dashboard', getDashboardStats);

// current user's tasks
router.get('/my', getMyTasks);

// admin — all tasks
router.get('/all', authorize('admin'), getAllTasks);

// tasks scoped to a project
router.post(
  '/project/:projectId',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Task title is required')
      .isLength({ max: 150 })
      .withMessage('Task title must be 150 characters or less'),
    body('description')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be 1000 characters or less'),
    body('status')
      .optional()
      .isIn(['todo', 'in_progress', 'review', 'done'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
    body('assignee')
      .optional({ checkFalsy: true })
      .isMongoId()
      .withMessage('Invalid assignee id'),
    body('dueDate')
      .optional({ checkFalsy: true })
      .isISO8601()
      .withMessage('Due date must be a valid date'),
  ],
  validate,
  createTask
);

router.get('/project/:projectId', getTasksByProject);

// single task operations
router
  .route('/:id')
  .put(
    [
      body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Task title cannot be empty')
        .isLength({ max: 150 })
        .withMessage('Task title must be 150 characters or less'),
      body('description')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Description must be 1000 characters or less'),
      body('status')
        .optional()
        .isIn(['todo', 'in_progress', 'review', 'done'])
        .withMessage('Invalid status'),
      body('priority')
        .optional()
        .isIn(['low', 'medium', 'high', 'urgent'])
        .withMessage('Invalid priority'),
      body('assignee')
        .optional({ checkFalsy: true })
        .isMongoId()
        .withMessage('Invalid assignee id'),
      body('dueDate')
        .optional({ checkFalsy: true })
        .isISO8601()
        .withMessage('Due date must be a valid date'),
    ],
    validate,
    updateTask
  )
  .delete(deleteTask);

module.exports = router;
