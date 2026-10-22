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

  if (diffInSeconds < 45) return 'just now';
  if (diffInSeconds < 90) return '1m ago';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 7200) return '1h ago';
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return 'yesterday';
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getStatusBadgeStyle = (status) => {
  switch (status) {
    case 'Open':
      return {
        bg: 'bg-[#f1f5f9] text-[#475569] border-slate-200/80',
        dot: 'bg-[#64748b]',
      };
    case 'In Progress':
      return {
        bg: 'bg-[#ede9fe] text-[#5b42d6] border-[#ddd6fe]',
        dot: 'bg-[#5b42d6]',
      };
    case 'Resolved':
    case 'Closed':
      return {
        bg: 'bg-[#dcfce7] text-[#15803d] border-emerald-200',
        dot: 'bg-[#16a34a]',
      };
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
};

export const getPriorityBadgeStyle = (priority) => {
  switch (priority) {
    case 'Critical':
    case 'Urgent':
      return 'bg-[#ffe4e6] text-[#e11d48] border-[#fecdd3] font-medium';
    case 'High':
      return 'bg-[#ffedd5] text-[#c2410c] border-[#fed7aa] font-medium';
    case 'Medium':
    case 'Med':
      return 'bg-[#e0f2fe] text-[#0284c7] border-[#bae6fd] font-medium';
    case 'Low':
      return 'bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0] font-medium';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200 font-medium';
  }
};

export const getCategoryBadgeStyle = (category) => {
  switch (category) {
    case 'Frontend':
      return 'bg-sky-50 text-sky-700 border-sky-200/80 font-medium';
    case 'Backend':
      return 'bg-slate-100 text-slate-700 border-slate-200 font-medium';
    case 'Database':
      return 'bg-teal-50 text-teal-700 border-teal-200/80 font-medium';
    case 'UI/UX':
      return 'bg-[#f3f0ff] text-[#5b42d6] border-[#e0d9fc] font-medium';
    case 'Feature Request':
      return 'bg-[#ede9fe] text-[#4c35c2] border-[#ddd6fe] font-medium';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200 font-medium';
  }
};
