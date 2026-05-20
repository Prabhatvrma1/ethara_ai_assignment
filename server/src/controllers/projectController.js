const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const ApiError = require('../utils/apiError');

const getId = (value) => value?._id?.toString() || value?.toString();
const uniqueIds = (ids) => [...new Set(ids.filter(Boolean).map((id) => id.toString()))];

const ensureUsersExist = async (memberIds) => {
  if (!memberIds.length) return;

  const usersFound = await User.countDocuments({ _id: { $in: memberIds } });
  if (usersFound !== memberIds.length) {
    throw new ApiError(400, 'One or more selected members do not exist');
  }
};

const canManageProject = (project, user) =>
  user.role === 'admin' || getId(project.owner) === user._id.toString();

const canViewProject = (project, user) =>
  canManageProject(project, user) ||
  project.members.some((memberId) => getId(memberId) === user._id.toString());

const populateProject = (query) =>
  query.populate('owner', 'name email role').populate('members', 'name email role');

// POST /api/projects
const createProject = async (req, res, next) => {
  try {
    const memberIds = uniqueIds([req.user._id, ...(req.body.members || [])]);
    await ensureUsersExist(memberIds);

    const project = await Project.create({
      name: req.body.name,
      description: req.body.description || '',
      owner: req.user._id,
      members: memberIds,
    });

    await project.populate('owner members', 'name email role');

    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects
const getProjects = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { members: req.user._id };
    const projects = await populateProject(Project.find(query)).sort('-createdAt');

    res.json({ success: true, count: projects.length, data: projects });
  } catch (err) {
    next(err);
  }
};

// GET /api/projects/:id
const getProject = async (req, res, next) => {
  try {
    const project = await populateProject(Project.findById(req.params.id));

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    if (!canViewProject(project, req.user)) {
      throw new ApiError(403, 'Not authorized to view this project');
    }

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    if (!canManageProject(project, req.user)) {
      throw new ApiError(403, 'Only the project owner or an admin can update this project');
    }

    if (req.body.name !== undefined) project.name = req.body.name;
    if (req.body.description !== undefined) project.description = req.body.description;

    if (req.body.members !== undefined) {
      const memberIds = uniqueIds([project.owner, ...req.body.members]);
      await ensureUsersExist(memberIds);
      project.members = memberIds;
    }

    await project.save();
    await project.populate('owner members', 'name email role');

    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    if (!canManageProject(project, req.user)) {
      throw new ApiError(403, 'Only the project owner or an admin can delete this project');
    }

    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
