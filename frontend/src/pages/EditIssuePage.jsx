import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { LoadingState } from '../components/common/LoadingState';
import { PRIORITIES, STATUSES } from '../utils/constants';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const EditIssuePage = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    assignedTo: ''
  });
  const [issue, setIssue] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadIssueAndUsers = async () => {
      try {
        setLoading(true);
        const res = await issueService.getIssueById(id);
        const issueData = res.data;
        setIssue(issueData);

        // Authorization check
        const isCreator = issueData.createdBy?._id === user?._id;
        if (!isAdmin && !isCreator) {
          error('You do not have permission to edit this issue');
          navigate(`/issues/${id}`);
          return;
        }

        setFormData({
          title: issueData.title || '',
          description: issueData.description || '',
          priority: issueData.priority || 'Medium',
          status: issueData.status || 'Open',
          assignedTo: issueData.assignedTo?._id || ''
        });

        if (isAdmin) {
          const userRes = await userService.getUsers({ status: 'active' });
          setUsers(userRes.data || []);
        }
      } catch (err) {
        error(err.message || 'Failed to load issue');
        navigate('/issues');
      } finally {
        setLoading(false);
      }
    };

    loadIssueAndUsers();
  }, [id, isAdmin, user?._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Issue Title is required';
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title cannot exceed 200 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Issue Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority
      };

      if (isAdmin) {
        payload.status = formData.status;
        payload.assignedTo = formData.assignedTo || null;
      }

      await issueService.updateIssue(id, payload);
      success('Issue updated successfully');
      navigate(`/issues/${id}`);
    } catch (err) {
      error(err.message || 'Failed to update issue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading issue editor..." />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div>
        <button
          onClick={() => navigate(`/issues/${id}`)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Issue Details</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-6 shadow-xs">
        <div className="pb-4 border-b border-slate-200 mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Edit Issue: <span className="text-blue-600">{issue?.issueNumber}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update issue details and assignment parameters
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full text-xs p-2.5 bg-white border rounded-md text-slate-800 focus:outline-none focus:ring-1 transition-colors ${
                errors.title
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-slate-200 focus:ring-blue-600'
              }`}
            />
            {errors.title && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={6}
              value={formData.description}
              onChange={handleChange}
              className={`w-full text-xs p-3 bg-white border rounded-md text-slate-800 focus:outline-none focus:ring-1 transition-colors resize-y ${
                errors.description
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-slate-200 focus:ring-blue-600'
              }`}
            />
            {errors.description && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Admin only fields: Status & Assignment */}
            {isAdmin && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assignee
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => navigate(`/issues/${id}`)}
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {submitting ? (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
