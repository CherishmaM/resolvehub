import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  PlusCircle,
  Lightbulb,
  Users,
  Settings,
  Shield,
  Search,
  Upload,
  ArrowBigUp,
  Flame,
  Rocket,
  Check,
  Clock,
  Bug,
  AlertTriangle,
} from 'lucide-react';

export const NavHoverPreview = ({ path, isVisible, currentProject }) => {
  if (!isVisible) return null;

  const projectKey = currentProject?.key || 'CORE';
  const projectName = currentProject?.name || 'Core Platform';

  const renderPageSnapshot = () => {
    switch (path) {
      case '/dashboard':
        return (
          <div className="space-y-2 p-2.5 text-[9px] bg-slate-50/70 select-none">
            {/* Header */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
              <div>
                <p className="font-bold text-slate-800 text-[11px] leading-tight">Dashboard</p>
                <p className="text-[8px] text-slate-400">Overview of project bug health & progress</p>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#F0EBFF] text-[#6257D9] text-[8px] font-bold font-mono">
                [{projectKey}]
              </span>
            </div>

            {/* 4 Mini Stat Cards */}
            <div className="grid grid-cols-4 gap-1.5">
              <div className="bg-white p-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[8px] font-medium text-slate-600">Tickets</span>
                  <Bug className="w-2.5 h-2.5 text-[#6257D9]" />
                </div>
                <p className="text-xs font-bold text-slate-900 mt-0.5">12</p>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[8px] font-medium text-amber-600">Open</span>
                  <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                </div>
                <p className="text-xs font-bold text-amber-600 mt-0.5">4</p>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[8px] font-medium text-purple-600">In Prog</span>
                  <Clock className="w-2.5 h-2.5 text-purple-500" />
                </div>
                <p className="text-xs font-bold text-purple-600 mt-0.5">3</p>
              </div>
              <div className="bg-white p-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[8px] font-medium text-emerald-600">Done</span>
                  <Check className="w-2.5 h-2.5 text-emerald-500" />
                </div>
                <p className="text-xs font-bold text-emerald-600 mt-0.5">5</p>
              </div>
            </div>

            {/* Mini Priority Distribution Bars */}
            <div className="bg-white p-2 rounded-xl border border-slate-200/80 space-y-1">
              <p className="text-[8px] font-bold text-slate-700">Priority Distribution</p>
              <div className="space-y-1">
                <div>
                  <div className="flex justify-between text-[7px] text-slate-400">
                    <span>Critical</span>
                    <span>25%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-1/4 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[7px] text-slate-400">
                    <span>High / Medium</span>
                    <span>65%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#6257D9] h-full w-[65%] rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case '/projects':
        return (
          <div className="space-y-2 p-2.5 text-[9px] bg-slate-50/70 select-none">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
              <div>
                <p className="font-bold text-slate-800 text-[11px] leading-tight">Projects & Workspaces</p>
                <p className="text-[8px] text-slate-400">Isolated project workspaces & team rosters</p>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#6257D9] text-white text-[8px] font-semibold">
                + New
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white p-2 rounded-xl border border-[#D6CCF7] shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#F0EBFF] text-[#6257D9]">
                    CORE
                  </span>
                  <span className="text-[7px] px-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="font-bold text-slate-800 text-[9px] truncate">Core Platform</p>
                <div className="flex justify-between text-[7px] text-slate-400 pt-0.5">
                  <span>12 Tickets</span>
                  <span>5 Members</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                    MOB
                  </span>
                  <span className="text-[7px] px-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="font-bold text-slate-800 text-[9px] truncate">Mobile App</p>
                <div className="flex justify-between text-[7px] text-slate-400 pt-0.5">
                  <span>8 Tickets</span>
                  <span>3 Members</span>
                </div>
              </div>
            </div>
          </div>
        );

      case '/issues':
        return (
          <div className="space-y-2 p-2.5 text-[9px] bg-slate-50/70 select-none">
            {/* Header with Search and Filter Pills */}
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
              <div>
                <p className="font-bold text-slate-800 text-[11px] leading-tight">Bug Tracker</p>
                <p className="text-[8px] text-slate-400">Live ticket queue for {projectName}</p>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#F0EBFF] text-[#6257D9] text-[8px] font-mono font-bold">
                [{projectKey}]
              </span>
            </div>

            {/* Filter bar preview */}
            <div className="flex items-center gap-1">
              <span className="px-1.5 py-0.5 rounded-md bg-[#6257D9] text-white text-[7px] font-semibold">
                All
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[7px]">
                Open
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[7px]">
                In Progress
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 text-[7px]">
                Resolved
              </span>
            </div>

            {/* Mini Issue Table */}
            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden divide-y divide-slate-100">
              <div className="p-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-mono text-[7px] text-slate-400">#102</span>
                  <span className="font-medium text-slate-800 truncate">Token refresh on mobile</span>
                </div>
                <span className="text-[7px] font-semibold px-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Open
                </span>
              </div>
              <div className="p-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-mono text-[7px] text-slate-400">#101</span>
                  <span className="font-medium text-slate-800 truncate">Database connection pooling</span>
                </div>
                <span className="text-[7px] font-semibold px-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  In Prog
                </span>
              </div>
              <div className="p-1.5 flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-mono text-[7px] text-slate-400">#100</span>
                  <span className="font-medium text-slate-800 truncate">Dark theme contrast fix</span>
                </div>
                <span className="text-[7px] font-semibold px-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Resolved
                </span>
              </div>
            </div>
          </div>
        );

      case '/issues/new':
        return (
          <div className="space-y-2 p-2.5 text-[9px] bg-slate-50/70 select-none">
            <div className="pb-1.5 border-b border-slate-200/70">
              <p className="font-bold text-slate-800 text-[11px] leading-tight">Create New Issue</p>
              <p className="text-[8px] text-slate-400">File a bug report or task for {projectName}</p>
            </div>

            <div className="space-y-1.5 bg-white p-2 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[7px] font-bold text-slate-600 uppercase">Issue Title</span>
                <div className="w-full h-4 bg-slate-50 rounded border border-slate-200 px-1 text-[7px] flex items-center text-slate-400">
                  Brief description of the bug...
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div>
                  <span className="text-[7px] font-bold text-slate-600 uppercase">Project</span>
                  <div className="w-full h-4 bg-slate-50 rounded border border-slate-200 px-1 text-[7px] flex items-center text-[#6257D9] font-bold">
                    {projectKey} - {projectName}
                  </div>
                </div>
                <div>
                  <span className="text-[7px] font-bold text-slate-600 uppercase">Priority</span>
                  <div className="w-full h-4 bg-slate-50 rounded border border-slate-200 px-1 text-[7px] flex items-center text-slate-700">
                    High Priority
                  </div>
                </div>
              </div>

              {/* Upload Dropzone Preview */}
              <div className="border border-dashed border-[#ddd6fe] rounded p-1 text-center bg-[#faf9fe]">
                <Upload className="w-2.5 h-2.5 text-[#6257D9] mx-auto" />
                <span className="text-[7px] text-slate-500">Visual proof attachment (optional)</span>
              </div>

              <div className="pt-1 flex justify-end">
                <span className="px-2 py-0.5 rounded bg-[#6257D9] text-white text-[7px] font-semibold">
                  Create Ticket
                </span>
              </div>
            </div>
          </div>
        );

      case '/ideas':
        return (
          <div className="space-y-2 p-2.5 text-[9px] bg-slate-50/70 select-none">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/70">
              <div>
                <p className="font-bold text-slate-800 text-[11px] leading-tight">Brainstorming Ideas</p>
                <p className="text-[8px] text-slate-400">Team concepts, upvotes & discussions</p>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-[#6257D9] text-white text-[8px] font-semibold">
                + Share
              </span>
            </div>

            {/* 4 Mini Metrics */}
            <div className="grid grid-cols-4 gap-1">
              <div className="bg-white p-1 rounded border border-slate-200 text-center">
                <p className="font-bold text-slate-800 text-[9px]">8</p>
                <span className="text-[6px] text-slate-400">Ideas</span>
              </div>
              <div className="bg-white p-1 rounded border border-slate-200 text-center">
                <p className="font-bold text-purple-600 text-[9px]">3</p>
                <span className="text-[6px] text-slate-400">Exploring</span>
              </div>
              <div className="bg-white p-1 rounded border border-slate-200 text-center">
                <p className="font-bold text-emerald-600 text-[9px]">2</p>
                <span className="text-[6px] text-slate-400">Planned</span>
              </div>
              <div className="bg-white p-1 rounded border border-slate-200 text-center">
                <p className="font-bold text-amber-500 text-[9px]">24</p>
                <span className="text-[6px] text-slate-400">Upvotes</span>
              </div>
            </div>

            {/* Mini Idea Card */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[7px] font-semibold px-1 rounded bg-[#F0EBFF] text-[#6257D9]">
                  Feature Proposal
                </span>
                <span className="text-[7px] px-1 rounded bg-purple-50 text-purple-700">
                  Exploring
                </span>
              </div>
              <p className="font-bold text-slate-800 text-[8px]">Real-time collaboration presence</p>
              <div className="flex items-center justify-between text-[7px] text-slate-400 pt-0.5">
                <span className="flex items-center gap-0.5 text-[#6257D9] font-bold">
                  <ArrowBigUp className="w-2.5 h-2.5" /> 14 upvotes
                </span>
                <span>3 comments</span>
              </div>
            </div>
          </div>
        );

      case '/team':
        return (
          <div className="space-y-2 p-2.5 text-[9px] bg-slate-50/70 select-none">
            <div className="pb-1.5 border-b border-slate-200/70 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-[11px] leading-tight">Team Members</p>
                <p className="text-[8px] text-slate-400">Organization roster & roles</p>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[8px] font-semibold">
                Directory
              </span>
            </div>

            <div className="space-y-1 bg-white p-2 rounded-xl border border-slate-200/80">
              <div className="flex items-center justify-between p-1 rounded hover:bg-slate-50">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-[#6257D9] text-white flex items-center justify-center font-bold text-[7px]">
                    C
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-[8px]">Cherishma M</p>
                    <p className="text-[6px] text-slate-400">Team Lead</p>
                  </div>
                </div>
                <span className="text-[7px] px-1 rounded bg-[#EAE4FF] text-[#6257D9] font-bold">
                  Org Admin
                </span>
              </div>

              <div className="flex items-center justify-between p-1 rounded hover:bg-slate-50">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-[7px]">
                    H
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-[8px]">Harshith</p>
                    <p className="text-[6px] text-slate-400">Software Engineer</p>
                  </div>
                </div>
                <span className="text-[7px] px-1 rounded bg-slate-100 text-slate-600 font-medium">
                  Member
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none hidden md:block animate-fade-in"
      style={{ width: '290px' }}
    >
      {/* Left-pointing arrow connecting to hovered nav item */}
      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-[#E3D9FF] rotate-45 z-10" />

      {/* Miniature Browser Window Container */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-2xl border border-[#E3D9FF] shadow-2xl shadow-[#6257D9]/20 overflow-hidden ring-1 ring-[#6257D9]/10">
        {/* Browser Top Chrome Header */}
        <div className="px-3 py-1.5 bg-[#FAF9FF] border-b border-slate-200/80 flex items-center justify-between">
          {/* Window control dots */}
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>

          {/* URL Pill */}
          <div className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[8px] font-mono text-slate-500 max-w-[170px] truncate shadow-2xs">
            resolvehub.dev{path}
          </div>

          {/* Live indicator dot */}
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[7px] font-bold text-slate-400 uppercase tracking-wider">
              Preview
            </span>
          </div>
        </div>

        {/* Scaled Realistic Snapshot Content */}
        {renderPageSnapshot()}
      </div>
    </div>
  );
};
