import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStatsApi } from '../api/dashboard.api';
import { StatCard } from '../components/ui/StatCard';
import { StatusDonutChart } from '../components/dashboard/StatusDonutChart';
import { PriorityBarChart } from '../components/dashboard/PriorityBarChart';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { StatusBadge } from '../components/ui/StatusBadge';
import { PriorityBadge } from '../components/ui/PriorityBadge';
import { formatDate, getCategoryBadgeStyle } from '../utils/formatters';
import {
  FolderKanban,
  AlertCircle,
  Clock,
  CheckCircle2,
  UserCheck,
  ArrowRight,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
} from 'lucide-react';

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getDashboardStatsApi();
      setStats(response.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" text="Fetching real-time ResolveHub metrics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <ErrorMessage message={error} onRetry={fetchStats} />
      </div>
    );
  }

  const totals = stats?.totals || { total: 0, open: 0, inProgress: 0, resolved: 0, assignedToMe: 0 };
  const recentIssues = stats?.recentIssues || [];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-gradient-to-r from-slate-950 via-slate-900 to-[#0e1629] p-6 sm:p-7 rounded-2xl text-white border border-slate-800/80 shadow-card overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-56 h-56 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Live System Tracking
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">System Health & Issue Velocity</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time status tracking for engineering defects, infrastructure alerts, and feature requests.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <Link
            to="/issues?assignedTo=me"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-xs font-semibold text-slate-200 border border-slate-700/60 shadow-xs transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Assigned to me: {totals.assignedToMe}</span>
          </Link>
          <Link
            to="/issues/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-sm shadow-indigo-600/30 active:scale-[0.98] transition-all"
          >
            Report Issue
          </Link>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Issues"
          value={totals.total}
          icon={FolderKanban}
          color="indigo"
          subtitle="All recorded workspace tickets"
        />
        <StatCard
          title="Open Issues"
          value={totals.open}
          icon={AlertCircle}
          color="blue"
          subtitle="Awaiting triage or assignment"
        />
        <StatCard
          title="In Progress"
          value={totals.inProgress}
          icon={Clock}
          color="amber"
          subtitle="Active investigations"
        />
        <StatCard
          title="Resolved"
          value={totals.resolved}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Successfully closed"
        />
      </div>

      {/* Real Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Status Distribution</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Live Aggregate
            </span>
          </div>
          <StatusDonutChart data={stats?.statusDistribution || []} />
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Priority Volume</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Severity Ranking
            </span>
          </div>
          <PriorityBarChart data={stats?.priorityDistribution || []} />
        </div>
      </div>

      {/* Recent Issues Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Recently Updated Issues</h3>
            <p className="text-xs text-slate-400 mt-0.5">Most recent activity across team projects</p>
          </div>
          <Link
            to="/issues"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentIssues.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No issues created yet. Report your first issue to see it here!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentIssues.map((issue) => {
              const categoryStyle = getCategoryBadgeStyle(issue.category);
              return (
                <div
                  key={issue._id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-medium border shrink-0 ${categoryStyle}`}
                    >
                      {issue.category}
                    </span>
                    <Link
                      to={`/issues/${issue._id}`}
                      className="text-xs font-semibold text-slate-800 hover:text-indigo-600 transition-colors truncate"
                    >
                      {issue.title}
                    </Link>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
                    <PriorityBadge priority={issue.priority} />
                    <StatusBadge status={issue.status} />
                    <span className="text-[11px] text-slate-400">
                      {formatDate(issue.createdAt)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
