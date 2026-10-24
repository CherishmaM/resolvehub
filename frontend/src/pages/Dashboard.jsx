import React, { useState, useEffect, useRef } from 'react';
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
  const [barsAnimated, setBarsAnimated] = useState(false);
  const hasLoadedOnce = useRef(false);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getDashboardStatsApi();
      setStats(response.data);

      // Trigger smooth bar sweep after real data lands
      setTimeout(() => {
        setBarsAnimated(true);
      }, 60);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
      hasLoadedOnce.current = true;
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

  // Severity configuration with distinct pastel tokens
  const severityConfig = [
    {
      id: 'Critical',
      label: 'Critical',
      count: criticalCount,
      color: 'bg-[#F43F5E]',
      track: 'bg-[#FFE4E6]/70',
      glow: 'group-hover:shadow-[0_0_12px_rgba(244,63,94,0.45)]',
      textAccent: 'group-hover:text-[#F43F5E]',
      badge: 'bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]',
      delay: '0ms',
    },
    {
      id: 'High',
      label: 'High',
      count: highCount,
      color: 'bg-[#FB923C]',
      track: 'bg-[#FFEDD5]/70',
      glow: 'group-hover:shadow-[0_0_12px_rgba(251,146,60,0.45)]',
      textAccent: 'group-hover:text-[#FB923C]',
      badge: 'bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA]',
      delay: '70ms',
    },
    {
      id: 'Medium',
      label: 'Medium',
      count: mediumCount,
      color: 'bg-[#F59E0B]',
      track: 'bg-[#FEF3C7]/70',
      glow: 'group-hover:shadow-[0_0_12px_rgba(245,158,11,0.45)]',
      textAccent: 'group-hover:text-[#F59E0B]',
      badge: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
      delay: '140ms',
    },
    {
      id: 'Low',
      label: 'Low',
      count: lowCount,
      color: 'bg-[#6257D9]',
      track: 'bg-[#EDE9FE]/70',
      glow: 'group-hover:shadow-[0_0_12px_rgba(98,87,217,0.45)]',
      textAccent: 'group-hover:text-[#6257D9]',
      badge: 'bg-[#EDE9FE] text-[#5B42D6] border border-[#DDD6FE]',
      delay: '210ms',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header: Title & Subtitle with Enterprise SaaS Polish */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#272443] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#5E597B] mt-1 font-medium">
            Overview of your project's bug health, activity, and team progress
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchStats} />}

      {/* 2. Soft Lavender & Pastel Statistic Cards with Real Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Bug Tracker"
          value={totals.total}
          icon={Bug}
          color="purple"
          subtitle="All logged tickets"
          loading={loading}
          className="animate-fade-up"
        />
        <StatCard
          title="New Issues"
          value={totals.open}
          icon={AlertTriangle}
          color="amber"
          subtitle="Needs attention"
          loading={loading}
          className="animate-fade-up [animation-delay:60ms]"
        />
        <StatCard
          title="In Progress"
          value={totals.inProgress}
          icon={Clock}
          color="blue"
          subtitle="Being resolved"
          loading={loading}
          className="animate-fade-up [animation-delay:120ms]"
        />
        <StatCard
          title="Resolved"
          value={totals.resolved}
          icon={Check}
          color="green"
          subtitle="Fixed & closed"
          loading={loading}
          className="animate-fade-up [animation-delay:180ms]"
        />
      </div>

      {/* 3. Urgent Action Alert Banner with Lavender Pastel Aesthetics */}
      <div className="bg-gradient-to-r from-[#F0EBFF] via-[#F7F3FF] to-[#EEF4FF] border border-[#E3D9FF] rounded-2xl p-4 sm:p-4.5 flex items-center justify-between shadow-[0_4px_16px_-4px_rgba(98,87,217,0.08)] select-none animate-slide-down [animation-delay:220ms] relative overflow-hidden">
        <div className="flex items-center gap-3.5 min-w-0 relative z-10">
          <div
            className={`w-9 h-9 rounded-xl bg-[#6257D9] text-white flex items-center justify-center shrink-0 shadow-2xs ${
              criticalCount > 0 ? 'animate-subtle-bounce' : ''
            }`}
          >
            <AlertTriangle className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold text-[#272443] truncate">
              {criticalCount > 0
                ? `${criticalCount} critical bugs require immediate attention`
                : 'All critical bugs resolved — 0 blockers active'}
            </p>
            <p className="text-[11px] sm:text-xs text-[#6257D9] font-medium mt-0.5 truncate">
              {criticalCount > 0
                ? `${criticalIssueKeys.join(', ')} — review these first`
                : 'Great job! System health is looking strong across projects.'}
            </p>
          </div>
        </div>

        {/* Ambient Corner Flare */}
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-[#6257D9]/10 via-[#3B82F6]/5 to-transparent blur-xl pointer-events-none" />
      </div>

      {/* 4. Two-Column Lower Section: Recent Activity (left) + Severity Breakdown (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start animate-fade-up [animation-delay:260ms]">
        {/* Left Column: Recent Activity (60-65% width) */}
        <div className="lg:col-span-7 xl:col-span-8 relative overflow-hidden bg-gradient-to-br from-[#FAF8FF] via-white to-[#F7F3FF] rounded-2xl border border-[#E3D9FF] p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(98,87,217,0.06)]">
          {/* Subtle Ambient Radial Glow & Watermark in Corner */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-[#6257D9]/10 via-[#3B82F6]/5 to-transparent blur-2xl pointer-events-none" />
          <svg
            className="absolute -bottom-8 -right-8 w-44 h-44 text-[#6257D9] opacity-[0.035] pointer-events-none"
            viewBox="0 0 120 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <circle cx="60" cy="60" r="54" strokeDasharray="4 4" />
            <circle cx="60" cy="60" r="36" />
            <circle cx="60" cy="60" r="18" strokeDasharray="2 2" />
            <line x1="60" y1="6" x2="60" y2="114" />
            <line x1="6" y1="60" x2="114" y2="60" />
          </svg>

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E3D9FF]/70 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EAE2FF] text-[#6257D9] flex items-center justify-center border border-[#DDD0FE] shadow-2xs">
                <Activity className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <h2 className="text-sm font-bold text-[#272443]">Recent Activity</h2>
            </div>
            <Link
              to="/issues"
              className="text-xs font-semibold text-[#6257D9] hover:text-[#5246c7] flex items-center gap-1 transition-colors group"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200" />
            </Link>
          </div>

          {loading ? (
            <div className="py-6 space-y-4 relative z-10">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="py-3 border-b border-[#E3D9FF]/40 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-14 rounded-md animate-shimmer-lavender"></div>
                    <div className="h-4 w-20 rounded-full animate-shimmer-lavender"></div>
                  </div>
                  <div className="h-4 w-3/4 rounded-md animate-shimmer-lavender"></div>
                </div>
              ))}
            </div>
          ) : recentIssues.length === 0 ? (
            <div className="py-12 px-4 text-center relative z-10 animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-[#F0EBFF] text-[#6257D9] border border-[#E3D9FF] mx-auto flex items-center justify-center mb-3 shadow-2xs">
                <Inbox className="w-5 h-5 stroke-[1.8]" />
              </div>
              <p className="text-sm font-semibold text-[#272443]">No issues reported yet</p>
              <p className="text-xs text-[#5E597B] mt-1 max-w-sm mx-auto">
                Your workspace will track incoming bug tickets, assignees, and progress updates here.
              </p>
              <Link
                to="/issues/new"
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#6257D9] hover:bg-[#5246c7] rounded-xl shadow-2xs hover:shadow-xs active:scale-[0.98] transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Issue</span>
              </Link>
            </div>
          ) : (
            <div className="relative z-10 pt-2">
              {/* Vertical Decorative Timeline Spine Line */}
              <div className="absolute left-[8px] top-6 bottom-6 w-[1.5px] bg-gradient-to-b from-[#E3D9FF] via-[#DDD6FE] to-[#F0EBFF] opacity-80 pointer-events-none" />

              <div className="space-y-1">
                {recentIssues.map((issue, idx) => {
                  const keyNumber = issue._id.slice(-3).toUpperCase();
                  const keyFormatted = `BUG-${keyNumber}`;

                  // Distinct soft pastel status pills
                  const statusStyles = {
                    Open: 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]',
                    'In Progress': 'bg-[#F0EBFF] text-[#6257D9] border border-[#E3D9FF]',
                    Resolved: 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]',
                  };

                  // Priority pill styles
                  const priorityStyles = {
                    Critical: 'bg-[#FFE4E6] text-[#E11D48] border border-[#FECDD3]',
                    High: 'bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA]',
                    Medium: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
                    Low: 'bg-[#EDE9FE] text-[#5B42D6] border border-[#DDD6FE]',
                  };

                  return (
                    <div
                      key={issue._id}
                      className="relative pl-6 py-3 px-3 rounded-xl hover:bg-[#F7F3FF]/90 transition-all duration-200 group animate-fade-up border-l-2 border-transparent hover:border-[#6257D9]"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      {/* Left Edge Accent Bar */}
                      <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#6257D9] opacity-0 group-hover:opacity-100 transition-all duration-200" />

                      {/* Small circular activity timeline marker */}
                      <div className="absolute left-[4px] top-[18px] w-2.5 h-2.5 rounded-full bg-[#6257D9] ring-4 ring-[#EDE9FE] shadow-2xs transition-all duration-200 group-hover:scale-125 group-hover:ring-[#DDD6FE]" />

                      {/* Top Row: Key + Status + Priority */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-semibold text-[#5E597B] bg-[#EAE2FF]/60 border border-[#DDD0FE]/70 px-1.5 py-0.5 rounded group-hover:bg-[#EAE2FF] transition-colors">
                            {keyFormatted}
                          </span>
                          <span
                            className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1 transition-all duration-200 ${
                              statusStyles[issue.status] || 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                            <span>{issue.status}</span>
                          </span>
                        </div>

                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md transition-all duration-200 ${
                            priorityStyles[issue.priority] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {issue.priority}
                        </span>
                      </div>

                      {/* Middle Row: Title + Relative Timestamp + Hover Arrow */}
                      <div className="flex items-center justify-between gap-3 mt-1.5">
                        <Link
                          to={`/issues/${issue._id}`}
                          className="text-xs sm:text-sm font-semibold text-[#272443] group-hover:text-[#6257D9] transition-colors duration-200 truncate block flex-1"
                          title={issue.title}
                        >
                          {issue.title}
                        </Link>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] text-[#7C759A] font-medium whitespace-nowrap">
                            {formatRelativeTime(issue.createdAt)}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#6257D9] group-hover:translate-x-1.5 transition-all duration-200" />
                        </div>
                      </div>

                      {/* Bottom Row: Category / Component */}
                      <div className="mt-1">
                        <span className="text-[11px] text-[#7C759A] font-medium">
                          {issue.category || 'General'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Severity Breakdown (35-40% width) */}
        <div className="lg:col-span-5 xl:col-span-4 relative overflow-hidden bg-gradient-to-br from-[#FAF8FF] via-[#F7F4FD] to-[#F3EEFE] rounded-2xl border border-[#E3D9FF] p-5 sm:p-6 shadow-[0_4px_20px_-4px_rgba(98,87,217,0.08)] flex flex-col justify-between">
          {/* Subtle Ambient Radial Glow in Top-Left & Watermark */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-gradient-to-br from-[#6257D9]/10 via-[#3B82F6]/5 to-transparent blur-2xl pointer-events-none" />
          <svg
            className="absolute -bottom-8 -right-8 w-44 h-44 text-[#6257D9] opacity-[0.035] pointer-events-none"
            viewBox="0 0 120 120"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          >
            <rect x="20" y="20" width="80" height="80" rx="16" strokeDasharray="3 3" />
            <circle cx="60" cy="60" r="28" />
            <circle cx="60" cy="60" r="14" strokeDasharray="2 2" />
          </svg>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-2.5 pb-4 border-b border-[#E3D9FF]/70">
              <div className="w-8 h-8 rounded-xl bg-[#EAE2FF] text-[#6257D9] flex items-center justify-center border border-[#DDD0FE] shadow-2xs shrink-0">
                <BarChart2 className="w-4 h-4 stroke-[2]" />
              </div>
              <h2 className="text-sm font-bold text-[#272443]">Severity Breakdown</h2>
            </div>

            {/* Horizontal progress bars with smooth staggered sweep & hover glows */}
            <div className="py-4 space-y-4">
              {severityConfig.map((item) => {
                const percentage =
                  totals.total > 0
                    ? Math.round((item.count / totals.total) * 100)
                    : 0;

                return (
                  <div
                    key={item.id}
                    className="group p-2.5 -mx-2.5 rounded-xl hover:bg-white/80 transition-all duration-200 cursor-default"
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-[#4A4568] group-hover:text-[#272443] transition-colors duration-200">
                        {item.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-[#7C759A] group-hover:text-[#4A4568] transition-colors duration-200">
                          {percentage}%
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all duration-200 ${item.badge} ${item.textAccent}`}
                        >
                          {item.count}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-full ${item.track} rounded-full h-2.5 group-hover:h-3 transition-all duration-300 ease-out overflow-hidden`}
                    >
                      <div
                        className={`h-full rounded-full ${item.color} ${item.glow} group-hover:brightness-110 transition-all duration-700 ease-out`}
                        style={{
                          width: barsAnimated && totals.total > 0 ? `${(item.count / totals.total) * 100}%` : '0%',
                          transitionDelay: item.delay,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Resolution Rate Metric */}
          <div className="relative z-10 border-t border-[#E3D9FF]/70 pt-4 mt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-[#4A4568]">
              <TrendingUp className="w-4 h-4 text-[#6257D9]" />
              <span className="font-medium">Resolution rate:</span>
              <span className="font-bold text-[#272443]">{resolutionRate}%</span>
            </div>
            <span className="text-[11px] text-[#7C759A] font-medium">
              {totals.resolved}/{totals.total} resolved
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};