import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import { PlusCircle, RotateCcw } from 'lucide-react';

export const MyIssues = () => {
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

  const fetchMyIssues = async () => {
    try {
      setLoading(true);
      const params = {
        scope: 'my',
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
      error(err.message || 'Failed to load your issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIssues();
  }, [page, status, priority]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchMyIssues();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            My Reported Issues
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            All issues reported by you into the tracking system
          </p>
        </div>

        <Link
          to="/issues/create"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-md p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search within my reported issues..."
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
          <LoadingState message="Loading your issues..." />
        ) : issues.length === 0 ? (
          <EmptyState
            title="No reported issues found"
            description="You have not created any issues matching the selected filters."
            actionText="Report an Issue"
            onAction={() => navigate('/issues/create')}
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
