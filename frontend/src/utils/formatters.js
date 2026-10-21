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
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'In Progress':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'Resolved':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    default:
      return {
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
};

export const getPriorityBadgeStyle = (priority) => {
  switch (priority) {
    case 'Critical':
      return 'bg-rose-50 text-rose-700 border-rose-200 font-semibold';
    case 'High':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'Medium':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'Low':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

export const getCategoryBadgeStyle = (category) => {
  switch (category) {
    case 'Frontend':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Backend':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    case 'Database':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200';
    case 'UI/UX':
      return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
    case 'Feature Request':
      return 'bg-teal-50 text-teal-700 border-teal-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};
