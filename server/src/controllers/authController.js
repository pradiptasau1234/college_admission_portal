const User = require('../models/User');
const Application = require('../models/Application');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// @desc    Register a new applicant
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { fullName, email, mobile, password } = req.body;

    if (!fullName || !email || !mobile || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full name, email, mobile number, and password.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const user = await User.create({
      name: fullName.trim(),
      email: email.toLowerCase().trim(),
      contactNumber: mobile.trim(),
      password,
      role: 'applicant'
    });

    // Auto-create initial draft application for the applicant
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const appId = `IEM-${randomSuffix}`;

    const application = await Application.create({
      applicationId: appId,
      user: user._id,
      status: 'Draft',
      personalDetails: {
        fullName: user.name,
        email: user.email,
        mobile: user.contactNumber
      },
      timeline: [{
        status: 'Draft',
        timestamp: new Date(),
        note: 'Account registered and application draft initialized.',
        actor: user.name
      }]
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        role: user.role
      },
      applicationId: application.applicationId
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during registration.'
    });
  }
};

// @desc    Login user (Applicant or Admin)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        contactNumber: user.contactNumber,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during login.'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch current user profile.'
    });
  }
};
