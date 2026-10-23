import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const labelMap = {
    Critical: 'Critical',
    Urgent: 'Critical',
    High: 'High',
    Medium: 'Medium',
    Med: 'Medium',
    Low: 'Low',
  };

  const label = labelMap[priority] || priority;

  const styleMap = {
    Critical: 'bg-[#ffe4e6] text-[#e11d48]',
    Urgent: 'bg-[#ffe4e6] text-[#e11d48]',
    High: 'bg-[#ffedd5] text-[#c2410c]',
    Medium: 'bg-[#e0f2fe] text-[#0284c7]',
    Med: 'bg-[#e0f2fe] text-[#0284c7]',
    Low: 'bg-[#dcfce7] text-[#16a34a]',
  };

  const isCritical = priority === 'Critical' || priority === 'Urgent';

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
        styleMap[priority] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {isCritical && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className="animate-beacon-pulse absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500" />
        </span>
      )}
      <span>{label}</span>
    </span>
  );
};
