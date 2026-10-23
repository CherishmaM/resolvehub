import React from 'react';

export const StatusBadge = ({ status, showOriginal = false }) => {
  const labelMap = {
    Open: 'To Do',
    'In Progress': 'In Progress',
    Resolved: 'Done',
    Closed: 'Backlog',
  };

  const label = showOriginal ? status : (labelMap[status] || status);

  const styleMap = {
    Open: 'bg-[#f1f5f9] text-[#475569] border border-slate-200/60',
    'In Progress': 'bg-[#f1f5f9] text-[#475569] border border-slate-200/60',
    Resolved: 'bg-[#f1f5f9] text-[#475569] border border-slate-200/60',
    Closed: 'bg-[#f1f5f9] text-[#475569] border border-slate-200/60',
  };

  const isInProgress = status === 'In Progress';

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
        styleMap[status] || 'bg-[#f1f5f9] text-[#475569]'
      }`}
    >
      {isInProgress && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-beacon-pulse absolute inline-flex h-full w-full rounded-full bg-[#818cf8] opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#6257D9]" />
        </span>
      )}
      <span>{label}</span>
    </span>
  );
};
