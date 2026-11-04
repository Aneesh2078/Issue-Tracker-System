import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { issueService } from '../../services/issueService';
import { useToast } from '../../hooks/useToast';
import { X, UserCheck } from 'lucide-react';

export const AssignUserModal = ({ isOpen, issue, onClose, onAssigned }) => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    if (isOpen) {
      setSelectedUserId(issue?.assignedTo?._id || '');
      loadUsers();
    }
  }, [isOpen, issue]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const res = await userService.getUsers({ status: 'active' });
      setUsers(res.data || []);
    } catch (err) {
      error(err.message || 'Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!issue) return;

    try {
      setSubmitting(true);
      const assignedVal = selectedUserId === '' ? null : selectedUserId;
      const res = await issueService.assignIssue(issue._id, assignedVal);
      success(res.message || 'Issue assignment updated');
      onAssigned(res.data);
      onClose();
    } catch (err) {
      error(err.message || 'Failed to assign issue');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !issue) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-md border border-slate-200 shadow-lg max-w-md w-full overflow-hidden animate-scale-in">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-800">
              Assign Issue: <span className="text-blue-600">{issue.issueNumber}</span>
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleAssign}>
          <div className="p-5 space-y-4">
            <p className="text-xs text-slate-600">
              Select an active team member to assign responsibility for{' '}
              <strong className="text-slate-800">"{issue.title}"</strong>.
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Assignee
              </label>
              {loadingUsers ? (
                <div className="text-xs text-slate-500 py-2">Loading active users...</div>
              ) : (
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-md py-2 px-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                >
                  <option value="">Unassigned (None)</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) — {u.role}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-3.5 py-1.5 text-xs font-medium rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingUsers}
              className="px-3.5 py-1.5 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5"
            >
              {submitting && (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              Save Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
