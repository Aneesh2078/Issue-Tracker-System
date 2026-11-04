const express = require('express');
const router = express.Router();
const {
  getIssues,
  getIssueById,
  createIssue,
  updateIssue,
  deleteIssue,
  assignIssue,
  updateIssueStatus
} = require('../controllers/issueController');
const {
  getCommentsByIssue,
  addComment
} = require('../controllers/commentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const {
  issueValidation,
  commentValidation
} = require('../middleware/validationMiddleware');

// Comments nested under issues
router.get('/:id/comments', protect, getCommentsByIssue);
router.post('/:id/comments', protect, commentValidation, addComment);

// Issue CRUD & operations
router.get('/', protect, getIssues);
router.post('/', protect, issueValidation, createIssue);
router.get('/:id', protect, getIssueById);
router.put('/:id', protect, updateIssue);
router.delete('/:id', protect, adminOnly, deleteIssue);
router.put('/:id/assign', protect, adminOnly, assignIssue);
router.patch('/:id/status', protect, updateIssueStatus);

module.exports = router;
