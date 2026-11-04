const Comment = require('../models/Comment');
const Issue = require('../models/Issue');

/**
 * @desc    Get comments for an issue
 * @route   GET /api/issues/:id/comments
 * @access  Private
 */
const getCommentsByIssue = async (req, res, next) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Role check: Admin or participant
    if (
      req.user.role !== 'admin' &&
      issue.createdBy.toString() !== req.user._id.toString() &&
      (!issue.assignedTo || issue.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot view comments for this issue'
      });
    }

    const comments = await Comment.find({ issue: req.params.id })
      .populate('user', 'name email role')
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add comment to an issue
 * @route   POST /api/issues/:id/comments
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;
    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Role check: Admin or participant
    if (
      req.user.role !== 'admin' &&
      issue.createdBy.toString() !== req.user._id.toString() &&
      (!issue.assignedTo || issue.assignedTo.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot post comments on this issue'
      });
    }

    const comment = await Comment.create({
      issue: req.params.id,
      user: req.user._id,
      text: text.trim()
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email role');

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: populatedComment
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete comment
 * @route   DELETE /api/comments/:id
 * @access  Private (Comment author OR Admin)
 */
const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    const isAdmin = req.user.role === 'admin';
    const isAuthor = comment.user.toString() === req.user._id.toString();

    if (!isAdmin && !isAuthor) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only delete your own comments'
      });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCommentsByIssue,
  addComment,
  deleteComment
};
