import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { userService } from '../services/userService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { IssueTable } from '../components/issues/IssueTable';
import { SearchBar } from '../components/common/SearchBar';
import { FilterDropdown } from '../components/common/FilterDropdown';
import { Pagination } from '../components/common/Pagination';
import { AssignUserModal } from '../components/issues/AssignUserModal';
import { ConfirmationDialog } from '../components/common/ConfirmationDialog';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { PRIORITIES, STATUSES } from '../utils/constants';
import { PlusCircle, RotateCcw } from 'lucide-react';

export const AllIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [users, setUsers] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIssues, setTotalIssues] = useState(0);

  // Modals
  const [selectedIssueForAssign, setSelectedIssueForAssign] = useState(null);
  const [selectedIssueForDelete, setSelectedIssueForDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { user, isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  // Load active users for filter dropdown
  useEffect(() => {
    if (isAdmin) {
      userService.getUsers()
        .then((res) => setUsers(res.data || []))
        .catch(() => {});
    }
  }, [isAdmin]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: status || undefined,
        priority: priority || undefined,
        assignee: assignee || undefined
      };

      const res = await issueService.getIssues(params);
      setIssues(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalIssues(res.totalIssues || 0);
    } catch (err) {
      error(err.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [page, status, priority, assignee]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchIssues();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setAssignee('');
    setPage(1);
  };

  const handleDeleteIssue = async () => {
    if (!selectedIssueForDelete) return;
    try {
      setDeleting(true);
      await issueService.deleteIssue(selectedIssueForDelete._id);
      success(`Issue ${selectedIssueForDelete.issueNumber} deleted`);
      setSelectedIssueForDelete(null);
      fetchIssues();
    } catch (err) {
      error(err.message || 'Failed to delete issue');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {isAdmin ? 'All Organizational Issues' : 'All Accessible Issues'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View, filter, manage and track issues across the system
          </p>
        </div>

        <Link
          to="/issues/create"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Issue</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by ID, title, or description..."
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <FilterDropdown
            label="Status"
            value={status}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
            options={STATUSES}
            allLabel="All Statuses"
          />

          <FilterDropdown
            label="Priority"
            value={priority}
            onChange={(val) => {
              setPriority(val);
              setPage(1);
            }}
            options={PRIORITIES}
            allLabel="All Priorities"
          />

          {isAdmin && (
            <FilterDropdown
              label="Assignee"
              value={assignee}
              onChange={(val) => {
                setAssignee(val);
                setPage(1);
              }}
              options={[
                { label: 'Unassigned', value: 'unassigned' },
                ...users.map((u) => ({ label: u.name, value: u._id }))
              ]}
              allLabel="All Assignees"
            />
          )}

          {(search || status || priority || assignee) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Issues Table Container */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        {loading ? (
          <LoadingState message="Loading issues..." />
        ) : issues.length === 0 ? (
          <EmptyState
            title="No matching issues"
            description={
              search || status || priority || assignee
                ? 'Try adjusting your search criteria or clearing filters.'
                : 'No issues currently exist.'
            }
            actionText={search || status || priority || assignee ? 'Reset Filters' : 'Create Issue'}
            onAction={
              search || status || priority || assignee
                ? handleResetFilters
                : () => navigate('/issues/create')
            }
          />
        ) : (
          <>
            <IssueTable
              issues={issues}
              currentUserId={user?._id}
              isAdmin={isAdmin}
              onAssign={(issue) => setSelectedIssueForAssign(issue)}
              onDelete={(issue) => setSelectedIssueForDelete(issue)}
            />
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalIssues}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <AssignUserModal
        isOpen={!!selectedIssueForAssign}
        issue={selectedIssueForAssign}
        onClose={() => setSelectedIssueForAssign(null)}
        onAssigned={() => fetchIssues()}
      />

      <ConfirmationDialog
        isOpen={!!selectedIssueForDelete}
        title="Delete Issue"
        message={`Are you sure you want to permanently delete ${selectedIssueForDelete?.issueNumber}? This action cannot be reversed.`}
        confirmText="Delete Issue"
        isLoading={deleting}
        onConfirm={handleDeleteIssue}
        onCancel={() => setSelectedIssueForDelete(null)}
      />
    </div>
  );
};
