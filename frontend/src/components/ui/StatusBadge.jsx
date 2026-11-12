import React from 'react';
import { CheckCircle2, Clock, AlertCircle, CircleDot } from 'lucide-react';

export const StatusBadge = ({ status, showOriginal = false }) => {
  const labelMap = {
    Open: 'To Do',
    'In Progress': 'In Progress',
    Resolved: 'Done',
    Closed: 'Closed',
  };

  const label = showOriginal ? status : (labelMap[status] || status);

  // Distinct color-coding for each status to separate rows visually
  const configMap = {
    Open: {
      className: 'bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE]',
      dotColor: 'bg-[#6366F1]',
      icon: CircleDot,
    },
    'In Progress': {
      className: 'bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA]',
      dotColor: 'bg-[#F97316]',
      icon: Clock,
      pulse: true,
    },
    Resolved: {
      className: 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]',
      dotColor: 'bg-[#10B981]',
      icon: CheckCircle2,
    },
    Closed: {
      className: 'bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]',
      dotColor: 'bg-[#94A3B8]',
      icon: AlertCircle,
    },
  };

  const config = configMap[status] || {
    className: 'bg-[#F1F5F9] text-[#475569] border border-slate-200',
    dotColor: 'bg-slate-400',
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide shadow-2xs transition-all ${config.className}`}
    >
      {config.pulse ? (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-beacon-pulse absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
        </span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dotColor}`} />
      )}
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
