import React from 'react';
import {
  Bug,
  Users,
  Zap,
  Search,
  FileText,
  Layers,
  FolderKanban,
  BarChart2,
  Settings,
  X,
} from 'lucide-react';
import { LogoMark } from '../ui/Logo';

// Dot Matrix decoration component
const DotGrid = ({ rows = 4, cols = 6, className = '' }) => (
  <div
    className={`grid gap-2.5 pointer-events-none select-none ${className}`}
    style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    aria-hidden="true"
  >
    {Array.from({ length: rows * cols }).map((_, i) => (
      <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#c7d2fe]/75" />
    ))}
  </div>
);

export const AuthShowcase = () => {
  return (
    <div className="relative w-full max-w-[650px] select-none">
      {/* Decorative dot matrix: Top Right */}
      <DotGrid
        rows={4}
        cols={6}
        className="absolute top-0 right-2 z-0 opacity-80"
      />

      {/* Decorative dot matrix: Bottom Center */}
      <DotGrid
        rows={3}
        cols={6}
        className="absolute -bottom-4 left-40 z-0 opacity-70"
      />

      {/* Decorative Organic Purple Waves in Bottom Right Corner */}
      <svg
        className="absolute -bottom-14 -right-14 w-80 h-80 pointer-events-none z-0 opacity-60 overflow-visible"
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M120 300 C180 260, 240 240, 300 250 L300 300 L120 300 Z"
          fill="url(#wave-grad-1)"
        />
        <path
          d="M60 300 C150 210, 210 180, 300 200 L300 300 L60 300 Z"
          fill="url(#wave-grad-2)"
          opacity="0.5"
        />
        <defs>
          <linearGradient id="wave-grad-1" x1="120" y1="240" x2="300" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#c4b5fd" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
          <linearGradient id="wave-grad-2" x1="60" y1="180" x2="300" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ddd6fe" />
            <stop offset="1" stopColor="#c4b5fd" />
          </linearGradient>
        </defs>
      </svg>

      {/* Header Section */}
      <div className="relative z-10 mb-7">
        <span className="text-[11px] font-semibold tracking-widest text-[#6257D9] uppercase">
          BUILD BETTER TOGETHER
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold text-[#20212B] tracking-tight leading-tight mt-1.5">
          Organize issues.<br />
          Ship faster.
        </h2>
        <p className="text-sm text-slate-500 mt-2 max-w-md leading-relaxed font-normal">
          ResolveHub helps you track bugs, manage projects and work better as a team.
        </p>
      </div>

      {/* Showcase Content: Features on the left, UI Window on the right */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start gap-7 sm:gap-8 pb-8">
        {/* Left Side: 3 Feature Bullets with dedicated width */}
        <div className="w-full sm:w-52 shrink-0 space-y-5 pt-1">
          {/* Feature 1 */}
          <div className="flex items-start gap-3.5 group cursor-default transition-transform duration-200 hover:translate-x-1">
            <div className="w-11 h-11 rounded-2xl bg-[#e0e7ff]/80 text-[#6257D9] flex items-center justify-center shrink-0 shadow-xs transition-all duration-200 group-hover:scale-110 group-hover:bg-[#6257D9] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#6257D9]/30">
              <Bug className="w-5 h-5" strokeWidth={1.9} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight group-hover:text-[#6257D9] transition-colors">
                Keep track of issues
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-normal leading-snug">
                Never miss what matters.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-3.5 group cursor-default transition-transform duration-200 hover:translate-x-1">
            <div className="w-11 h-11 rounded-2xl bg-[#e0e7ff]/80 text-[#6257D9] flex items-center justify-center shrink-0 shadow-xs transition-all duration-200 group-hover:scale-110 group-hover:bg-[#6257D9] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#6257D9]/30">
              <Users className="w-5 h-5" strokeWidth={1.9} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight group-hover:text-[#6257D9] transition-colors">
                Work together
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-normal leading-snug">
                Stay aligned, always.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-3.5 group cursor-default transition-transform duration-200 hover:translate-x-1">
            <div className="w-11 h-11 rounded-2xl bg-[#e0e7ff]/80 text-[#6257D9] flex items-center justify-center shrink-0 shadow-xs transition-all duration-200 group-hover:scale-110 group-hover:bg-[#6257D9] group-hover:text-white group-hover:shadow-md group-hover:shadow-[#6257D9]/30">
              <Zap className="w-5 h-5" strokeWidth={1.9} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight group-hover:text-[#6257D9] transition-colors">
                Make real progress
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 font-normal leading-snug">
                Turn ideas into action.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Floating App Window Mockup */}
        <div className="flex-1 min-w-[320px] max-w-[390px] relative w-full">
          {/* Main App Window Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-2xl shadow-indigo-950/10 overflow-hidden backdrop-blur-xs animate-float-slow transition-all duration-500 hover:shadow-indigo-900/20 hover:-translate-y-1">
            {/* Window title bar with dots */}
            <div className="px-4 py-2.5 bg-slate-50/60 border-b border-slate-100 flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#34d399]" />
            </div>

            {/* Window layout: Mini Sidebar + Issues Main */}
            <div className="flex min-h-[220px]">
              {/* Mini Sidebar */}
              <div className="w-28 bg-slate-50/40 border-r border-slate-100 p-2.5 flex flex-col justify-between shrink-0">
                <div className="space-y-3">
                  {/* Brand mark */}
                  <div className="flex items-center gap-1.5 px-1 py-0.5">
                    <LogoMark size="sm" className="h-4 w-4" />
                    <span className="font-bold text-[10px] text-slate-800 tracking-tight">
                      ResolveHub
                    </span>
                  </div>

                  {/* Nav links */}
                  <div className="space-y-0.5 text-[10px]">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#eff2fe] text-[#6257D9] font-semibold">
                      <Layers className="w-3 h-3" />
                      <span>Issues</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                      <FolderKanban className="w-3 h-3 text-slate-400" />
                      <span>Projects</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>Team</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                      <BarChart2 className="w-3 h-3 text-slate-400" />
                      <span>Reports</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
                      <Settings className="w-3 h-3 text-slate-400" />
                      <span>Settings</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 p-3 sm:p-3.5 space-y-2.5 overflow-hidden">
                {/* Header & Search */}
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs text-slate-900 tracking-tight">
                    Issues
                  </h4>
                  <div className="relative">
                    <Search className="w-2.5 h-2.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      readOnly
                      placeholder="Search issues..."
                      className="w-24 pl-5 pr-2 py-0.5 text-[9px] bg-slate-50 border border-slate-200/80 rounded-md text-slate-600 placeholder:text-slate-400 focus:outline-none pointer-events-none"
                    />
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 text-[9px] border-b border-slate-100 pb-1 font-medium">
                  <span className="text-[#6257D9] font-semibold border-b-2 border-[#6257D9] pb-0.5 -mb-1">
                    All
                  </span>
                  <span className="text-slate-400">Open</span>
                  <span className="text-slate-400">In Progress</span>
                  <span className="text-slate-400">Resolved</span>
                </div>

                {/* Issues List */}
                <div className="space-y-1.5">
                  {/* Issue 1 */}
                  <div className="p-2 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-xs bg-white flex items-center justify-between gap-2 shadow-2xs transition-all duration-200 hover:scale-[1.01]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-slate-900 truncate">
                          Login error on mobile
                        </div>
                        <div className="text-[8px] text-slate-400 font-mono">
                          BUG-0247
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
                      <span className="w-1 h-1 rounded-full bg-rose-500" />
                      High
                    </span>
                  </div>

                  {/* Issue 2 */}
                  <div className="p-2 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-xs bg-white flex items-center justify-between gap-2 shadow-2xs transition-all duration-200 hover:scale-[1.01]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-slate-900 truncate">
                          Search not working
                        </div>
                        <div className="text-[8px] text-slate-400 font-mono">
                          BUG-0416
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-amber-50 text-amber-700 border border-amber-100 shrink-0">
                      <span className="w-1 h-1 rounded-full bg-amber-500" />
                      Medium
                    </span>
                  </div>

                  {/* Issue 3 */}
                  <div className="p-2 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-xs bg-white flex items-center justify-between gap-2 shadow-2xs transition-all duration-200 hover:scale-[1.01]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-slate-900 truncate">
                          UI alignment issue
                        </div>
                        <div className="text-[8px] text-slate-400 font-mono">
                          TASK-0198
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 shrink-0">
                      <span className="w-1 h-1 rounded-full bg-emerald-500" />
                      Low
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overlapping Floating Card: Project Progress (positioned overlapping window bottom without blocking bullets) */}
          <div
            className="absolute -bottom-6 left-3 sm:left-6 z-20 w-56 sm:w-60 bg-white rounded-2xl border border-slate-100/90 shadow-xl shadow-indigo-950/20 p-3 animate-float hover:shadow-2xl hover:shadow-indigo-900/25 transition-all duration-300"
            style={{ animationDelay: '2.5s' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-900">
                Project progress
              </span>
              <button
                type="button"
                className="text-slate-300 hover:text-slate-500 transition-colors p-0.5 rounded"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Donut Chart + Legend */}
            <div className="flex items-center justify-between gap-2.5">
              {/* SVG Donut Chart */}
              <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 64 64">
                  {/* Background Track */}
                  <circle
                    cx="32"
                    cy="32"
                    r="25"
                    className="stroke-slate-100"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  {/* Progress Arc 68% */}
                  <circle
                    cx="32"
                    cy="32"
                    r="25"
                    className="stroke-[#6257D9]"
                    strokeWidth="6"
                    strokeDasharray="157.08"
                    strokeDashoffset={157.08 * (1 - 0.68)}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-black text-slate-900 tracking-tight">
                    68%
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1 text-[9px] text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#6257D9] shrink-0" />
                  <span>Completed</span>
                  <span className="text-slate-400 font-normal ml-auto">68%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#38bdf8] shrink-0" />
                  <span>In progress</span>
                  <span className="text-slate-400 font-normal ml-auto">20%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#a5b4fc] shrink-0" />
                  <span>To do</span>
                  <span className="text-slate-400 font-normal ml-auto">12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthShowcase;
