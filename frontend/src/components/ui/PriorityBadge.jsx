import React from 'react';
import { getPriorityBadgeStyle } from '../../utils/formatters';

export const PriorityBadge = ({ priority }) => {
  const style = getPriorityBadgeStyle(priority);

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-medium ${style}`}
    >
      {priority}
    </span>
  );
};
