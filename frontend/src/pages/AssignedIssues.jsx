import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { issueService } from '../services/issueService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { IssueTable } from '../components/issues/IssueTable';
import { SearchBar } from '../components/common/SearchBar';
import { FilterDropdown } from '../components/common/FilterDropdown';
import { Pagination } from '../components/common/Pagination';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { PRIORITIES, STATUSES } from '../utils/constants';
import { RotateCcw } from 'lucide-react';

export const AssignedIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalIssues, setTotalIssues] = useState(0);

  const { user, isAdmin } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();

  const fetchAssignedIssues = async () => {
    try {
      setLoading(true);
      const params = {
        scope: 'assigned',
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: status || undefined,
        priority: priority || undefined
      };

      const res = await issueService.getIssues(params);
      setIssues(res.data || []);
      setTotalPages(res.totalPages || 1);
      setTotalIssues(res.totalIssues || 0);
    } catch (err) {
      error(err.message || 'Failed to load assigned issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedIssues();
  }, [page, status, priority]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchAssignedIssues();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Issues Assigned to Me
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Action items and development tasks assigned directly to your workflow
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search assigned tasks..."
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

          {(search || status || priority) && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white border border-slate-200 rounded-md shadow-xs overflow-hidden">
        {loading ? (
          <LoadingState message="Loading your assigned tasks..." />
        ) : issues.length === 0 ? (
          <EmptyState
            title="No assigned tasks"
            description="You currently have no issues assigned to you."
          />
        ) : (
          <>
            <IssueTable
              issues={issues}
              currentUserId={user?._id}
              isAdmin={isAdmin}
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
    </div>
  );
};
