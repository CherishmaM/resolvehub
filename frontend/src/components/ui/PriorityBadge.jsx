import React from 'react';
import { Flame, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

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

  const configMap = {
    Critical: {
      className: 'bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]',
      dotColor: 'bg-[#E11D48]',
      icon: Flame,
      pulse: true,
    },
    Urgent: {
      className: 'bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3]',
      dotColor: 'bg-[#E11D48]',
      icon: Flame,
      pulse: true,
    },
    High: {
      className: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
      dotColor: 'bg-[#D97706]',
      icon: ArrowUp,
    },
    Medium: {
      className: 'bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]',
      dotColor: 'bg-[#0EA5E9]',
      icon: ArrowRight,
    },
    Med: {
      className: 'bg-[#F0F9FF] text-[#0369A1] border border-[#BAE6FD]',
      dotColor: 'bg-[#0EA5E9]',
      icon: ArrowRight,
    },
    Low: {
      className: 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]',
      dotColor: 'bg-[#94A3B8]',
      icon: ArrowDown,
    },
  };

  const config = configMap[priority] || {
    className: 'bg-slate-100 text-slate-700 border border-slate-200',
    dotColor: 'bg-slate-400',
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-2xs transition-all ${config.className}`}
    >
      {config.pulse ? (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-beacon-pulse absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
        </span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}`} />
      )}
      <span>{label}</span>
    </span>
  );
};

export default PriorityBadge;
