import React from 'react';
import { getStatusBadgeStyle } from '../../utils/formatters';

export const StatusBadge = ({ status }) => {
  const style = getStatusBadgeStyle(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};
