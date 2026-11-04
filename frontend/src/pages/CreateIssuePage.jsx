import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { PRIORITIES } from '../utils/constants';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export const CreateIssuePage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    assignedTo: ''
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // If Admin, load users for assignment dropdown
  useEffect(() => {
    if (isAdmin) {
      setLoadingUsers(true);
      userService.getUsers({ status: 'active' })
        .then((res) => setUsers(res.data || []))
        .catch(() => {})
        .finally(() => setLoadingUsers(false));
    }
  }, [isAdmin]);

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

    if (!formData.priority) {
      newErrors.priority = 'Priority selection is required';
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

      if (isAdmin && formData.assignedTo) {
        payload.assignedTo = formData.assignedTo;
      }

      const res = await issueService.createIssue(payload);
      success(`Issue ${res.data?.issueNumber || ''} created successfully!`);
      navigate(`/issues/${res.data?._id}`);
    } catch (err) {
      error(err.message || 'Failed to create issue');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-md p-6 shadow-xs">
        <div className="pb-4 border-b border-slate-200 mb-6">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Create New Issue
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            File a technical bug, system requirement, or maintenance task
          </p>
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
              placeholder="e.g. Memory leak in high-frequency circuit analyzer driver"
              className={`w-full text-xs p-2.5 bg-white border rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors ${
                errors.title
                  ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-200 focus:ring-blue-600 focus:border-blue-600'
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
              placeholder="Provide a comprehensive explanation of the issue, steps to reproduce, and any expected behavior..."
              className={`w-full text-xs p-3 bg-white border rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors resize-y ${
                errors.description
                  ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-200 focus:ring-blue-600 focus:border-blue-600'
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
                Priority <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignment (Admin only) */}
            {isAdmin && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assignee (Admin Only)
                </label>
                {loadingUsers ? (
                  <div className="text-xs text-slate-500 py-2">Loading users...</div>
                ) : (
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  >
                    <option value="">Unassigned (None)</option>
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => navigate(-1)}
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
              Submit Issue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
