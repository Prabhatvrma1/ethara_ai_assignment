const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/apiError');

const serializeUser = (user, token) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  ...(token && { token }),
});

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, adminInviteCode } = req.body;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new ApiError(400, 'Email already registered');
    }

    const userCount = await User.estimatedDocumentCount();
    const inviteMatches =
      process.env.ADMIN_INVITE_CODE &&
      adminInviteCode === process.env.ADMIN_INVITE_CODE;

    if (adminInviteCode && !inviteMatches) {
      throw new ApiError(403, 'Invalid admin invite code');
    }

    const role = userCount === 0 || inviteMatches ? 'admin' : 'member';
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role,
    });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: serializeUser(user, token),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: serializeUser(user, token),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ 
      success: true, 
      data: serializeUser(user) 
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('name email role').sort('name email');
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, getAllUsers };
