import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { StatisticsCard } from '../components/common/StatisticsCard';
import { IssueTable } from '../components/issues/IssueTable';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import {
  Layers,
  CircleDot,
  Clock,
  CheckCircle2,
  PlusCircle,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const UserDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const { error } = useToast();
  const navigate = useNavigate();

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [statsRes, recentRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getRecentIssues()
      ]);
      setStats(statsRes.data);
      setRecentIssues(recentRes.data || []);
    } catch (err) {
      error(err.message || 'Failed to load your dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  const cards = stats?.cards || {
    totalIssues: 0,
    openIssues: 0,
    inProgressIssues: 0,
    closedIssues: 0
  };

  const chartData = stats?.statusDistribution || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            Welcome back, {user?.name}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Your personal dashboard: issues reported by you and tasks assigned to you
          </p>
        </div>

        <Link
          to="/issues/create"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Issue</span>
        </Link>
      </div>

      {/* 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatisticsCard
          title="My Total Issues"
          count={cards.totalIssues}
          icon={Layers}
          color="slate"
        />
        <StatisticsCard
          title="Open Issues"
          count={cards.openIssues}
          icon={CircleDot}
          color="blue"
        />
        <StatisticsCard
          title="In Progress"
          count={cards.inProgressIssues}
          icon={Clock}
          color="orange"
        />
        <StatisticsCard
          title="Resolved / Closed"
          count={cards.closedIssues}
          icon={CheckCircle2}
          color="green"
        />
      </div>

      {/* Analytics Chart & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-md p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                My Issue Status Breakdown
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">
              Real-time records
            </span>
          </div>

          <div className="h-64 mt-4 w-full">
            {cards.totalIssues === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No active issues assigned or reported by you yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#2563EB'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Priority Severity Breakdown */}
        <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-800">
                Priority Distribution
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              {[
                { label: 'Critical', key: 'critical', color: 'bg-red-500', text: 'text-red-700' },
                { label: 'High', key: 'high', color: 'bg-amber-500', text: 'text-amber-700' },
                { label: 'Medium', key: 'medium', color: 'bg-blue-500', text: 'text-blue-700' },
                { label: 'Low', key: 'low', color: 'bg-slate-400', text: 'text-slate-700' }
              ].map((item) => {
                const count = stats?.priorityCounts?.[item.key] || 0;
                const percentage = cards.totalIssues > 0 ? Math.round((count / cards.totalIssues) * 100) : 0;
                return (
                  <div key={item.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-600">{item.label}</span>
                      <span className={`font-semibold ${item.text}`}>{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <Link to="/issues/my" className="font-medium text-blue-600 hover:text-blue-700">
              My Created Issues &rarr;
            </Link>
            <Link to="/issues/assigned" className="font-medium text-blue-600 hover:text-blue-700">
              Assigned to Me &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Issues Table */}
      <div className="bg-white border border-slate-200 rounded-md p-5 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              My Recent Issues
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Items you created or need your attention
            </p>
          </div>
          <Link
            to="/issues/my"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            View all my issues &rarr;
          </Link>
        </div>

        {recentIssues.length === 0 ? (
          <EmptyState
            title="No issues yet"
            description="You have not created any issues and none are assigned to you."
            actionText="Create an Issue"
            onAction={() => navigate('/issues/create')}
          />
        ) : (
          <IssueTable
            issues={recentIssues}
            currentUserId={user?._id}
            isAdmin={false}
          />
        )}
      </div>
    </div>
  );
};
