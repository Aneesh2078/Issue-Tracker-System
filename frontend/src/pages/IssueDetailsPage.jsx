import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { CommentSection } from '../components/issues/CommentSection';
import { AssignUserModal } from '../components/issues/AssignUserModal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { LoadingState } from '../components/common/LoadingState';
import { formatDate, formatDateTime, getInitials } from '../utils/formatters';
import { STATUSES } from '../utils/constants';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  UserPlus,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const IssueDetailsPage = () => {
  const { id } = useParams();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status updating state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Modals state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchIssue = async () => {
    try {
      setLoading(true);
      const res = await issueService.getIssueById(id);
      setIssue(res.data);
    } catch (err) {
      error(err.message || 'Failed to load issue');
      navigate('/issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchIssue();
    }
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    if (!issue || newStatus === issue.status) return;
    try {
      setUpdatingStatus(true);
      const res = await issueService.updateIssueStatus(issue._id, newStatus);
      setIssue(res.data);
      success(`Status updated to "${newStatus}"`);
    } catch (err) {
      error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDeleteIssue = async () => {
    if (!issue) return;
    try {
      setDeleting(true);
      await issueService.deleteIssue(issue._id);
      success(`Issue ${issue.issueNumber} deleted`);
      navigate('/issues');
    } catch (err) {
      error(err.message || 'Failed to delete issue');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading issue details..." />;
  }

  if (!issue) {
    return (
      <div className="text-center py-12">
        <p className="text-xs text-slate-500">Issue not found or access denied.</p>
        <Link to="/issues" className="mt-3 inline-block text-xs text-blue-600 font-medium">
          Return to issues list
        </Link>
      </div>
    );
  }

  const isCreator = issue.createdBy?._id === user?._id;
  const isAssignee = issue.assignedTo?._id === user?._id;
  const canEdit = isAdmin || isCreator;
  const canChangeStatus = isAdmin || isAssignee;

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      {/* Top back navigation and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Issues</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {canEdit && (
            <Link
              to={`/issues/edit/${issue._id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </Link>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Assign</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Issue Card */}
      <div className="bg-white border border-slate-200 rounded-md p-4 sm:p-6 shadow-xs space-y-5 sm:space-y-6">
        {/* Issue Identification Header */}
        <div className="border-b border-slate-200 pb-4 sm:pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {issue.issueNumber}
              </span>
              <PriorityBadge priority={issue.priority} />
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              {canChangeStatus ? (
                <select
                  value={issue.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  className="text-xs bg-slate-50 border border-slate-200 rounded py-1 px-2.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 cursor-pointer disabled:opacity-50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              ) : (
                <StatusBadge status={issue.status} />
              )}
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight mt-3 break-words">
            {issue.title}
          </h2>
        </div>

        {/* Description Section */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Description
          </h3>
          <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-3.5 sm:p-4 rounded-md border border-slate-100 break-words">
            {issue.description}
          </div>
        </div>

        {/* Issue Metadata Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4 pt-4 border-t border-slate-200">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              Created By
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{issue.createdBy?.name || 'Unknown'}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              Assigned To
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              {issue.assignedTo ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{issue.assignedTo.name}</span>
                </>
              ) : (
                <span className="text-slate-400 font-normal italic">Unassigned</span>
              )}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              Created Date
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatDateTime(issue.createdAt)}</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-medium text-slate-400 block mb-1">
              Last Updated
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formatDateTime(issue.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments & Activity Section */}
      <CommentSection issueId={issue._id} />

      {/* Modals */}
      <AssignUserModal
        isOpen={showAssignModal}
        issue={issue}
        onClose={() => setShowAssignModal(false)}
        onAssigned={(updated) => setIssue(updated)}
      />

      <ConfirmationDialog
        isOpen={showDeleteModal}
        title="Delete Issue"
        message={`Are you sure you want to permanently delete ${issue.issueNumber}? This action cannot be reversed.`}
        confirmText="Delete Issue"
        isLoading={deleting}
        onConfirm={handleDeleteIssue}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
