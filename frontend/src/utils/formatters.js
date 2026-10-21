export const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Open':
      return {
        bg: 'bg-sky-50/90 text-sky-700 border-sky-200/80 ring-1 ring-sky-500/10',
        dot: 'bg-sky-500 ring-2 ring-sky-200',
      };
    case 'In Progress':
      return {
        bg: 'bg-amber-50/90 text-amber-700 border-amber-200/80 ring-1 ring-amber-500/10',
        dot: 'bg-amber-500 ring-2 ring-amber-200',
      };
    case 'Resolved':
      return {
        bg: 'bg-emerald-50/90 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-500/10',
        dot: 'bg-emerald-500 ring-2 ring-emerald-200',
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200 ring-1 ring-slate-400/10',
        dot: 'bg-slate-400',
      };
  }
};

export const getPriorityBadgeStyle = (priority) => {
  switch (priority) {
    case 'Critical':
      return 'bg-rose-50 text-rose-700 border-rose-200/80 ring-1 ring-rose-500/10 font-semibold';
    case 'High':
      return 'bg-orange-50 text-orange-700 border-orange-200/80 ring-1 ring-orange-500/10 font-medium';
    case 'Medium':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200/80 ring-1 ring-indigo-500/10 font-medium';
    case 'Low':
      return 'bg-slate-100/90 text-slate-600 border-slate-200/80 ring-1 ring-slate-400/10 font-medium';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200 font-medium';
  }
};

export const getCategoryBadgeStyle = (category) => {
  switch (category) {
    case 'Frontend':
      return 'bg-indigo-50/90 text-indigo-700 border-indigo-200/80 ring-1 ring-indigo-500/10 font-medium';
    case 'Backend':
      return 'bg-violet-50/90 text-violet-700 border-violet-200/80 ring-1 ring-violet-500/10 font-medium';
    case 'Database':
      return 'bg-cyan-50/90 text-cyan-700 border-cyan-200/80 ring-1 ring-cyan-500/10 font-medium';
    case 'UI/UX':
      return 'bg-fuchsia-50/90 text-fuchsia-700 border-fuchsia-200/80 ring-1 ring-fuchsia-500/10 font-medium';
    case 'Feature Request':
      return 'bg-teal-50/90 text-teal-700 border-teal-200/80 ring-1 ring-teal-500/10 font-medium';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200 font-medium';
  }
};
