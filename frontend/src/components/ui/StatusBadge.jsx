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

  return (
    <span
      className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-xs font-medium ${
        styleMap[status] || 'bg-[#f1f5f9] text-[#475569]'
      }`}
    >
      {label}
    </span>
  );
};
