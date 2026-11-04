const Issue = require('../models/Issue');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { getNextIssueNumber } = require('../services/issueNumberService');

/**
 * @desc    Get all issues with filters, search, sorting and pagination
 * @route   GET /api/issues
 * @access  Private
 */
const getIssues = async (req, res, next) => {
  try {
    const {
      search,
      status,
      priority,
      assignee,
      createdBy,
      scope,
      sort = '-createdAt',
      page = 1,
      limit = 10
    } = req.query;

    const query = {};

    // Role-based visibility
    if (req.user.role !== 'admin') {
      if (scope === 'my') {
        query.createdBy = req.user._id;
      } else if (scope === 'assigned') {
        query.assignedTo = req.user._id;
      } else {
        // By default normal users see issues they created OR are assigned to
        query.$or = [
          { createdBy: req.user._id },
          { assignedTo: req.user._id }
        ];
      }
    } else {
      // Admin scoping
      if (scope === 'my') {
        query.createdBy = req.user._id;
      } else if (scope === 'assigned') {
        query.assignedTo = req.user._id;
      }
    }

    // Assignee filter (if explicitly passed and allowed)
    if (assignee) {
      if (assignee === 'unassigned') {
        query.assignedTo = null;
      } else {
        query.assignedTo = assignee;
      }
    }

    // CreatedBy filter
    if (createdBy && req.user.role === 'admin') {
      query.createdBy = createdBy;
    }

    // Status filter
    if (status && ['Open', 'In Progress', 'Closed'].includes(status)) {
      query.status = status;
    }

    // Priority filter
    if (priority && ['Low', 'Medium', 'High', 'Critical'].includes(priority)) {
      query.priority = priority;
    }

    // Search filter across title, description, and issueNumber
    if (search && search.trim() !== '') {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      const searchConditions = [
        { title: searchRegex },
        { description: searchRegex },
        { issueNumber: searchRegex }
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOption = {};
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'priority') {
      sortOption = { priority: -1, createdAt: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const totalIssues = await Issue.countDocuments(query);
    const totalPages = Math.ceil(totalIssues / limitNum) || 1;

    const issues = await Issue.find(query)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role isActive')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: issues.length,
      totalIssues,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single issue by ID
 * @route   GET /api/issues/:id
 * @access  Private
 */
const getIssueById = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role isActive');

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Authorization: Admin can view any; user can view only if createdBy or assignedTo
    if (
      req.user.role !== 'admin' &&
      issue.createdBy._id.toString() !== req.user._id.toString() &&
      (!issue.assignedTo || issue.assignedTo._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this issue'
      });
    }

    res.status(200).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new issue
 * @route   POST /api/issues
 * @access  Private
 */
const createIssue = async (req, res, next) => {
  try {
    const { title, description, priority, assignedTo } = req.body;

    const issueNumber = await getNextIssueNumber();

    const issueData = {
      issueNumber,
      title,
      description,
      priority: priority || 'Medium',
      status: 'Open',
      createdBy: req.user._id
    };

    // Only Admin can assign user during creation
    if (req.user.role === 'admin' && assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return res.status(400).json({
          success: false,
          message: 'The selected assignee does not exist'
        });
      }
      issueData.assignedTo = assignedTo;
    }

    const issue = await Issue.create(issueData);
    const populatedIssue = await Issue.findById(issue._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role isActive');

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: populatedIssue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update issue details
 * @route   PUT /api/issues/:id
 * @access  Private
 */
const updateIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const { title, description, priority, status, assignedTo } = req.body;

    if (req.user.role === 'admin') {
      // Admin can update all fields
      if (title !== undefined) issue.title = title;
      if (description !== undefined) issue.description = description;
      if (priority !== undefined) issue.priority = priority;
      if (status !== undefined) issue.status = status;

      if (assignedTo !== undefined) {
        if (assignedTo === null || assignedTo === '') {
          issue.assignedTo = null;
        } else {
          const userExists = await User.findById(assignedTo);
          if (!userExists) {
            return res.status(400).json({
              success: false,
              message: 'Assigned user not found'
            });
          }
          issue.assignedTo = assignedTo;
        }
      }
    } else {
      // Normal user can only edit their own created issue
      if (issue.createdBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only edit issues you created'
        });
      }

      // Normal user can only edit title, description, priority
      if (title !== undefined) issue.title = title;
      if (description !== undefined) issue.description = description;
      if (priority !== undefined) issue.priority = priority;

      // If user tries to change assignedTo, ignore or reject
      if (assignedTo !== undefined && assignedTo !== (issue.assignedTo ? issue.assignedTo.toString() : null)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can assign or reassign issues'
        });
      }
    }

    await issue.save();

    const updatedIssue = await Issue.findById(issue._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role isActive');

    res.status(200).json({
      success: true,
      message: 'Issue updated successfully',
      data: updatedIssue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete an issue
 * @route   DELETE /api/issues/:id
 * @access  Private/Admin
 */
const deleteIssue = async (req, res, next) => {
  try {
    // Only Admin can delete issues
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only administrators can delete issues'
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Delete associated comments
    await Comment.deleteMany({ issue: issue._id });

    // Delete issue
    await Issue.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Issue ${issue.issueNumber} and associated comments deleted successfully`
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign issue to user
 * @route   PUT /api/issues/:id/assign
 * @access  Private/Admin
 */
const assignIssue = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only administrators can assign issues'
      });
    }

    const { assignedTo } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    if (assignedTo === null || assignedTo === '' || assignedTo === 'unassigned') {
      issue.assignedTo = null;
    } else {
      const user = await User.findById(assignedTo);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'The selected user does not exist'
        });
      }
      if (!user.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign issue to a deactivated user account'
        });
      }
      issue.assignedTo = user._id;
    }

    await issue.save();

    const updatedIssue = await Issue.findById(issue._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role isActive');

    res.status(200).json({
      success: true,
      message: 'Issue assignment updated successfully',
      data: updatedIssue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update issue status
 * @route   PATCH /api/issues/:id/status
 * @access  Private (Admin OR assigned user)
 */
const updateIssueStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['Open', 'In Progress', 'Closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value. Must be Open, In Progress, or Closed.'
      });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Permission check: Admin OR assigned user
    const isAdmin = req.user.role === 'admin';
    const isAssignee = issue.assignedTo && issue.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Only administrators or the assigned user can update the status'
      });
    }

    issue.status = status;
    await issue.save();

    const updatedIssue = await Issue.findById(issue._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role isActive');

    res.status(200).json({
      success: true,
      message: `Issue status updated to ${status}`,
      data: updatedIssue
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  assignIssue,
  updateIssueStatus
};

