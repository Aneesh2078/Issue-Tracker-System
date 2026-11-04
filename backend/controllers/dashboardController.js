const Issue = require('../models/Issue');

/**
 * @desc    Get dashboard metrics and statistics
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const filter = {};

    // For normal users, restrict counts to issues created by or assigned to them
    if (req.user.role !== 'admin') {
      filter.$or = [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ];
    }

    const [
      totalIssues,
      openIssues,
      inProgressIssues,
      closedIssues,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues
    ] = await Promise.all([
      Issue.countDocuments(filter),
      Issue.countDocuments({ ...filter, status: 'Open' }),
      Issue.countDocuments({ ...filter, status: 'In Progress' }),
      Issue.countDocuments({ ...filter, status: 'Closed' }),
      Issue.countDocuments({ ...filter, priority: 'Critical' }),
      Issue.countDocuments({ ...filter, priority: 'High' }),
      Issue.countDocuments({ ...filter, priority: 'Medium' }),
      Issue.countDocuments({ ...filter, priority: 'Low' })
    ]);

    // Status breakdown for charts
    const statusDistribution = [
      { name: 'Open', count: openIssues, color: '#2563EB' },
      { name: 'In Progress', count: inProgressIssues, color: '#F97316' },
      { name: 'Closed', count: closedIssues, color: '#16A34A' }
    ];

    // Priority breakdown for charts
    const priorityDistribution = [
      { name: 'Low', count: lowIssues, color: '#64748B' },
      { name: 'Medium', count: mediumIssues, color: '#3B82F6' },
      { name: 'High', count: highIssues, color: '#EAB308' },
      { name: 'Critical', count: criticalIssues, color: '#EF4444' }
    ];

    res.status(200).json({
      success: true,
      data: {
        cards: {
          totalIssues,
          openIssues,
          inProgressIssues,
          closedIssues
        },
        priorityCounts: {
          critical: criticalIssues,
          high: highIssues,
          medium: mediumIssues,
          low: lowIssues
        },
        statusDistribution,
        priorityDistribution
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent issues for dashboard
 * @route   GET /api/dashboard/recent-issues
 * @access  Private
 */
const getRecentIssues = async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role !== 'admin') {
      filter.$or = [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ];
    }

    const recentIssues = await Issue.find(filter)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role isActive')
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    res.status(200).json({
      success: true,
      count: recentIssues.length,
      data: recentIssues
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getRecentIssues
};
