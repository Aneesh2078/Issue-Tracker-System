const User = require('../models/User');
const Issue = require('../models/Issue');

/**
 * @desc    Get all users with search, filter, and assigned issues count
 * @route   GET /api/users
 * @access  Private/Admin (or authenticated for assignment dropdown)
 */
const getUsers = async (req, res, next) => {
  try {
    const { search, role, status } = req.query;

    const query = {};

    if (role && ['admin', 'user'].includes(role)) {
      query.role = role;
    }

    if (status !== undefined && status !== '') {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate assigned issues count for each user
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const assignedIssuesCount = await Issue.countDocuments({ assignedTo: u._id });
        const createdIssuesCount = await Issue.countDocuments({ createdBy: u._id });
        return {
          ...u,
          assignedIssuesCount,
          createdIssuesCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: usersWithCounts.length,
      data: usersWithCounts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const assignedIssuesCount = await Issue.countDocuments({ assignedTo: user._id });
    const createdIssuesCount = await Issue.countDocuments({ createdBy: user._id });

    res.status(200).json({
      success: true,
      data: {
        ...user,
        assignedIssuesCount,
        createdIssuesCount
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user active status (activate / deactivate)
 * @route   PATCH /api/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isActive boolean field is required'
      });
    }

    // Prevent admin from deactivating their own account
    if (req.user._id.toString() === req.params.id && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own administrative account'
      });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUserStatus
};
