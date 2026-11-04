import React from 'react';
import { PRIORITY_CONFIG } from '../../utils/constants';

export const PriorityBadge = ({ priority }) => {
  const config = PRIORITY_CONFIG[priority] || {
    label: priority || 'Normal',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.badgeClass}`}
    >
      {config.label}
    </span>
  );
};
