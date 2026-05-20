const express = require('express');
const { body } = require('express-validator');
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// all project routes need authentication
router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(
    [
      body('name')
        .trim()
        .notEmpty()
        .withMessage('Project name is required')
        .isLength({ max: 100 })
        .withMessage('Project name must be 100 characters or less'),
      body('description')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be 500 characters or less'),
      body('members')
        .optional()
        .isArray()
        .withMessage('Members must be an array'),
      body('members.*')
        .optional()
        .isMongoId()
        .withMessage('Invalid member id'),
    ],
    validate,
    createProject
  );

router
  .route('/:id')
  .get(getProject)
  .put(
    [
      body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Project name cannot be empty')
        .isLength({ max: 100 })
        .withMessage('Project name must be 100 characters or less'),
      body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Description must be 500 characters or less'),
      body('members')
        .optional()
        .isArray()
        .withMessage('Members must be an array'),
      body('members.*')
        .optional()
        .isMongoId()
        .withMessage('Invalid member id'),
    ],
    validate,
    updateProject
  )
  .delete(deleteProject);

module.exports = router;
