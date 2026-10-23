import React from 'react';
import { Search, X, RotateCcw, Filter } from 'lucide-react';

export const IssueFilters = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  onReset,
}) => {
  const hasActiveFilters = search || status || priority || category;

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-2xs space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search Input matching Image 2 */}
        <div className="lg:col-span-2 relative group">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#6257D9] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search issues..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6257D9]/15 focus:border-[#6257D9] transition-all duration-200"
          />
          {search && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-100 transition-all duration-150 animate-scale-in"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Filter */}
        <div>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className={`w-full py-2 px-3 text-xs rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6257D9]/15 focus:border-[#6257D9] transition-all duration-200 ${
              status
                ? 'bg-[#ede9fe]/40 border border-[#6257D9] text-[#6257D9] font-medium'
                : 'bg-slate-50 border border-slate-200/80 text-slate-700'
            }`}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value)}
            className={`w-full py-2 px-3 text-xs rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6257D9]/15 focus:border-[#6257D9] transition-all duration-200 ${
              priority
                ? 'bg-[#ede9fe]/40 border border-[#6257D9] text-[#6257D9] font-medium'
                : 'bg-slate-50 border border-slate-200/80 text-slate-700'
            }`}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Category Filter & Reset */}
        <div className="flex items-center gap-2">
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className={`w-full py-2 px-3 text-xs rounded-xl focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#6257D9]/15 focus:border-[#6257D9] transition-all duration-200 ${
              category
                ? 'bg-[#ede9fe]/40 border border-[#6257D9] text-[#6257D9] font-medium'
                : 'bg-slate-50 border border-slate-200/80 text-slate-700'
            }`}
          >
            <option value="">All Categories</option>
            <option value="Frontend">Frontend</option>
            <option value="Backend">Backend</option>
            <option value="Database">Database</option>
            <option value="UI/UX">UI/UX</option>
            <option value="Feature Request">Feature Request</option>
            <option value="Other">Other</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              title="Reset all filters"
              className="group p-2 text-slate-500 hover:text-[#6257D9] bg-slate-100 hover:bg-[#ede9fe]/60 rounded-xl shrink-0 transition-all duration-150 animate-scale-in"
            >
              <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform duration-300" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
