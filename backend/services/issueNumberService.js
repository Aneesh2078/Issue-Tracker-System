const Issue = require('../models/Issue');

/**
 * Generate next sequential issue number formatted as EX-1001, EX-1002, etc.
 */
const getNextIssueNumber = async () => {
  // Find the latest issue created
  const latestIssue = await Issue.findOne({}, { issueNumber: 1 })
    .sort({ createdAt: -1 })
    .lean();

  if (!latestIssue || !latestIssue.issueNumber) {
    return 'EX-1001';
  }

  // Parse issue number pattern EX-XXXX
  const match = latestIssue.issueNumber.match(/^EX-(\d+)$/);
  if (match) {
    const nextSeq = parseInt(match[1], 10) + 1;
    return `EX-${nextSeq}`;
  }

  // Fallback if custom pattern found
  const totalCount = await Issue.countDocuments();
  return `EX-${1001 + totalCount}`;
};

module.exports = { getNextIssueNumber };
