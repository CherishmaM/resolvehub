import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStatsApi } from '../api/dashboard.api';
import { StatCard } from '../components/ui/StatCard';
import { ErrorMessage } from '../components/ui/ErrorMessage';
import { formatRelativeTime } from '../utils/formatters';
import {
  Bug,
  AlertTriangle,
  Clock,
  Check,
  ChevronRight,
  Activity,
  BarChart2,
  TrendingUp,
  Inbox,
  Plus,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
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
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStats();
  }, []);

  const totals = stats?.totals || { total: 0, open: 0, inProgress: 0, resolved: 0, assignedToMe: 0 };
  const recentIssues = stats?.recentIssues || [];
  const priorityDistribution = stats?.priorityDistribution || [];

  // Helper to extract count for a priority level
  const getPriorityCount = (pName) => {
    const item = priorityDistribution.find(
      (p) => p.name?.toLowerCase() === pName.toLowerCase()
    );
    return item?.count || 0;
  };

  const criticalCount = getPriorityCount('Critical');
  const highCount = getPriorityCount('High');
  const mediumCount = getPriorityCount('Medium');
  const lowCount = getPriorityCount('Low');

  // Find critical issues for banner
  const criticalIssues = recentIssues.filter(
    (issue) =>
      issue.priority === 'Critical' &&
      issue.status !== 'Resolved'
  );

  const criticalIssueKeys =
    criticalIssues.length > 0
      ? criticalIssues.map((i) => `BUG-${i._id.slice(-3).toUpperCase()}`)
      : ['BUG-001', 'BUG-005'];

  // Resolution rate percentage
  const resolutionRate = totals.total > 0
    ? Math.round((totals.resolved / totals.total) * 100)
    : 0;

  // Max priority count for relative bar widths
  const maxPriorityCount = Math.max(criticalCount, highCount, mediumCount, lowCount, 1);

  return (
    <div className="space-y-6">
      {/* 1. Header: Title & Subtitle matching Reference Design Image 1 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Overview of your project's bug health and progress
        </p>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchStats} />}

      {/* 2. Four KPI Stat Cards in a row with distinct, purposeful status colors (informational) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Bugs"
          value={totals.total}
          icon={Bug}
          color="purple"
          subtitle="All projects"
          loading={loading}
        />
        <StatCard
          title="Open Bugs"
          value={totals.open}
          icon={AlertTriangle}
          color="amber"
          subtitle="Need attention"
          loading={loading}
        />
        <StatCard
          title="In Progress"
          value={totals.inProgress}
          icon={Clock}
          color="blue"
          subtitle="Being worked on"
          loading={loading}
        />
        <StatCard
          title="Resolved"
          value={totals.resolved}
          icon={Check}
          color="green"
          subtitle="Fixed & resolved"
          loading={loading}
        />
      </div>

      {/* 3. Urgent Action Alert Banner (informational, not clickable) */}
      <div className="bg-[#ede9fe]/80 border border-[#ddd6fe] rounded-2xl p-4 sm:p-4.5 flex items-center justify-between shadow-2xs select-none">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#5b42d6] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-[#3730a3] truncate">
              {criticalCount > 0
                ? `${criticalCount} critical bugs require immediate attention`
                : 'All critical bugs resolved — 0 blockers active'}
            </p>
            <p className="text-[11px] sm:text-xs text-[#6366f1] font-medium mt-0.5 truncate">
              {criticalCount > 0
                ? `${criticalIssueKeys.join(', ')} — review these first`
                : 'Great job! System health is looking strong across projects.'}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Two-Column Lower Section: Recent Activity (left) + Severity Breakdown (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Recent Activity (65% width) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#5b42d6]" />
              <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
            </div>
            <Link
              to="/issues"
              className="text-xs font-semibold text-[#5b42d6] hover:text-[#4338ca] flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-6 space-y-4 animate-pulse">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="py-3 border-b border-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-14 bg-slate-200 rounded"></div>
                    <div className="h-4 w-20 bg-slate-200 rounded-full"></div>
                  </div>
                  <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : recentIssues.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Inbox className="w-5 h-5 stroke-[1.8]" />
              </div>
              <p className="text-sm font-semibold text-slate-700">No issues reported yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Your workspace will track incoming bug tickets and updates here.
              </p>
              <Link
                to="/issues/new"
                className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#5b42d6] hover:bg-[#4c35c2] rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Issue</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100/90">
              {recentIssues.map((issue) => {
                const keyNumber = issue._id.slice(-3).toUpperCase();
                const keyFormatted = `BUG-${keyNumber}`;

                // Status pill styles matching Reference Image 1 & 2
                const statusStyles = {
                  Open: 'bg-[#e0e7ff] text-[#3730a3]',
                  'In Progress': 'bg-[#ede9fe] text-[#5b42d6]',
                  Resolved: 'bg-[#dcfce7] text-[#15803d]',
                };

                // Priority pill styles matching Image 1
                const priorityStyles = {
                  Critical: 'bg-[#ffe4e6] text-[#e11d48]',
                  High: 'bg-[#ffedd5] text-[#c2410c]',
                  Medium: 'bg-[#e0f2fe] text-[#0284c7]',
                  Low: 'bg-[#dcfce7] text-[#16a34a]',
                };

                return (
                  <div key={issue._id} className="py-3.5 first:pt-3 last:pb-1 group">
                    {/* Top Row: Key + Status + Priority */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                          {keyFormatted}
                        </span>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                            statusStyles[issue.status] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                          <span>{issue.status}</span>
                        </span>
                      </div>

                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                          priorityStyles[issue.priority] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {issue.priority}
                      </span>
                    </div>

                    {/* Middle Row: Title + Relative Timestamp */}
                    <div className="flex items-baseline justify-between gap-3 mt-1.5">
                      <Link
                        to={`/issues/${issue._id}`}
                        className="text-xs sm:text-sm font-semibold text-slate-800 group-hover:text-[#5b42d6] transition-colors truncate block"
                        title={issue.title}
                      >
                        {issue.title}
                      </Link>
                      <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap shrink-0">
                        {formatRelativeTime(issue.createdAt)}
                      </span>
                    </div>

                    {/* Bottom Row: Category / Component */}
                    <div className="mt-1">
                      <span className="text-[11px] text-slate-400 font-medium">
                        {issue.category || 'General'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Severity Breakdown (35% width) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-[#ede9fe] text-[#5b42d6] flex items-center justify-center shrink-0">
                <BarChart2 className="w-4 h-4 stroke-[2]" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Severity Breakdown</h2>
            </div>

            {/* Horizontal progress bars matching Image 1 */}
            <div className="py-4 space-y-4">
              {/* Critical */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">Critical</span>
                  <span className="font-bold text-slate-700">{criticalCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#f43f5e] transition-all duration-500"
                    style={{
                      width: `${totals.total > 0 ? (criticalCount / totals.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* High */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">High</span>
                  <span className="font-bold text-slate-700">{highCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#f97316] transition-all duration-500"
                    style={{
                      width: `${totals.total > 0 ? (highCount / totals.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Medium */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">Medium</span>
                  <span className="font-bold text-slate-700">{mediumCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#3b82f6] transition-all duration-500"
                    style={{
                      width: `${totals.total > 0 ? (mediumCount / totals.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Low */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-600">Low</span>
                  <span className="font-bold text-slate-700">{lowCount}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#10b981] transition-all duration-500"
                    style={{
                      width: `${totals.total > 0 ? (lowCount / totals.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Resolution Rate Metric */}
          <div className="border-t border-slate-100 pt-4 mt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <TrendingUp className="w-4 h-4 text-[#5b42d6]" />
              <span className="font-medium">Resolution rate:</span>
              <span className="font-bold text-slate-900">{resolutionRate}%</span>
            </div>
            <span className="text-[11px] text-slate-400">
              {totals.resolved}/{totals.total} resolved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
