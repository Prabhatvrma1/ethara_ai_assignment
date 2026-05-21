const Task = require('../models/Task');
const Project = require('../models/Project');
const ApiError = require('../utils/apiError');

const getId = (value) => value?._id?.toString() || value?.toString();
const isProjectMember = (project, userId) =>
  project.members.some((memberId) => getId(memberId) === userId.toString());

const canAccessProject = (project, user) =>
  user.role === 'admin' ||
  getId(project.owner) === user._id.toString() ||
  isProjectMember(project, user._id);

const canManageProject = (project, user) =>
  user.role === 'admin' || getId(project.owner) === user._id.toString();

const loadProjectForUser = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  if (!canAccessProject(project, user)) {
    throw new ApiError(403, 'Not authorized for this project');
  }

  return project;
};

const normalizeAssignee = (assignee) => (assignee === '' ? null : assignee || null);

const ensureAssigneeBelongsToProject = (project, assignee) => {
  if (!assignee) return;

  if (!isProjectMember(project, assignee)) {
    throw new ApiError(400, 'Assignee must be a project member');
  }
};

const populateTask = (task) =>
  task.populate([
    { path: 'project', select: 'name' },
    { path: 'assignee', select: 'name email role' },
    { path: 'createdBy', select: 'name email role' },
  ]);

// POST /api/tasks/project/:projectId
const createTask = async (req, res, next) => {
  try {
    const project = await loadProjectForUser(req.params.projectId, req.user);
    const assignee = normalizeAssignee(req.body.assignee);
    ensureAssigneeBelongsToProject(project, assignee);

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description || '',
      status: req.body.status || 'todo',
      priority: req.body.priority || 'medium',
      project: project._id,
      assignee,
      createdBy: req.user._id,
      dueDate: req.body.dueDate || null,
    });

    await populateTask(task);

    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/project/:projectId
const getTasksByProject = async (req, res, next) => {
  try {
    const project = await loadProjectForUser(req.params.projectId, req.user);

    const tasks = await Task.find({ project: project._id })
      .populate('assignee', 'name email role')
      .populate('createdBy', 'name email role')
      .sort('-createdAt');

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/my
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignee: req.user._id })
      .populate('project', 'name')
      .populate('createdBy', 'name email role')
      .sort('-createdAt');

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/all
const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .populate('project', 'name')
      .populate('assignee', 'name email role')
      .populate('createdBy', 'name email role')
      .sort('-createdAt');

    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    const project = await loadProjectForUser(task.project, req.user);
    const isAssignee = getId(task.assignee) === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // If user is only assignee (not admin/owner), they can only update status
    if (!isAdmin && isAssignee) {
      if (req.body.status !== undefined) {
        task.status = req.body.status;
      }
      // Reject any other field updates
      const forbiddenFields = ['title', 'description', 'priority', 'dueDate', 'assignee'];
      for (const field of forbiddenFields) {
        if (req.body[field] !== undefined && task[field] !== req.body[field]) {
          throw new ApiError(403, `Members can only update task status`);
        }
      }
    } else if (!isAdmin && !isAssignee) {
      // Non-admin, non-assignee members cannot edit tasks
      throw new ApiError(403, 'Only the assignee or admin can update this task');
    } else {
      // Admin or project owner can update all fields
      const assignee = normalizeAssignee(req.body.assignee);
      ensureAssigneeBelongsToProject(project, assignee);

      const allowedFields = ['title', 'description', 'status', 'priority', 'dueDate'];
      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          task[field] = field === 'dueDate' && req.body[field] === '' ? null : req.body[field];
        }
      });

      if (req.body.assignee !== undefined) {
        task.assignee = assignee;
      }
    }

    await task.save();
    await populateTask(task);

    res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    const project = await loadProjectForUser(task.project, req.user);
    if (!canManageProject(project, req.user)) {
      throw new ApiError(403, 'Only the project owner or an admin can delete tasks');
    }

    await task.deleteOne();
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/dashboard
const getDashboardStats = async (req, res, next) => {
  try {
    const matchQuery = req.user.role === 'admin' ? {} : { assignee: req.user._id };

    const [stats] = await Task.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          inProgress: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] },
          },
          review: { $sum: { $cond: [{ $eq: ['$status', 'review'] }, 1, 0] } },
          done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $ne: ['$dueDate', null] },
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'done'] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats || {
        total: 0,
        todo: 0,
        inProgress: 0,
        review: 0,
        done: 0,
        overdue: 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getMyTasks,
  getAllTasks,
  updateTask,
  deleteTask,
  getDashboardStats,
};
