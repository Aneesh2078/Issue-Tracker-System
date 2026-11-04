import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { formatDate } from '../../utils/formatters';
import { Eye, Edit3, Trash2, UserPlus } from 'lucide-react';

export const IssueTable = ({
  issues = [],
  currentUserId,
  isAdmin = false,
  onDelete,
  onAssign
}) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto bg-white border border-slate-200 rounded-md">
      <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
          <tr>
            <th scope="col" className="px-4 py-3">Issue ID</th>
            <th scope="col" className="px-4 py-3">Title</th>
            <th scope="col" className="px-4 py-3">Priority</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3">Assigned To</th>
            <th scope="col" className="px-4 py-3">Created Date</th>
            <th scope="col" className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-slate-700 bg-white">
          {issues.map((issue) => {
            const isCreator = issue.createdBy?._id === currentUserId;
            const canEdit = isAdmin || isCreator;

            return (
              <tr
                key={issue._id}
                className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                onClick={() => navigate(`/issues/${issue._id}`)}
              >
                <td className="px-4 py-3 font-semibold text-blue-600 whitespace-nowrap">
                  {issue.issueNumber}
                </td>
                <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">
                  {issue.title}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <PriorityBadge priority={issue.priority} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <StatusBadge status={issue.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                  {issue.assignedTo ? (
                    <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {issue.assignedTo.name}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  {formatDate(issue.createdAt)}
                </td>
                <td
                  className="px-4 py-3 whitespace-nowrap text-right space-x-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => navigate(`/issues/${issue._id}`)}
                    className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                    title="View Issue"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {canEdit && (
                    <button
                      onClick={() => navigate(`/issues/edit/${issue._id}`)}
                      className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title="Edit Issue"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  {isAdmin && onAssign && (
                    <button
                      onClick={() => onAssign(issue)}
                      className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                      title="Assign User"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  )}

                  {isAdmin && onDelete && (
                    <button
                      onClick={() => onDelete(issue)}
                      className="p-1 rounded text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Issue"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

