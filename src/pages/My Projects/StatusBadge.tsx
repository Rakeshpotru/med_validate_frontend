import React from 'react';
import clsx from 'clsx';

type StatusType = string; // Now any string from API

// Map known statuses to colors
const statusStyles: Record<string, { bg: string; text: string }> = {
  Active: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'Not Yet Started': { bg: 'bg-gray-100', text: 'text-gray-600' },
  Approved: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'On Hold': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Completed: { bg: 'bg-green-100', text: 'text-green-700' },
  Closed: { bg: 'bg-green-100', text: 'text-green-700' },
  'Incident Resolved': { bg: 'bg-green-100', text: 'text-green-700' },
  'Incident Raised': { bg: 'bg-blue-100', text: 'text-blue-700' },
  Reverted: { bg: 'bg-blue-100', text: 'text-blue-700' },
};

export const StatusBadge: React.FC<{ status: StatusType }> = ({ status }) => {
  const style = statusStyles[status] || { bg: 'bg-gray-100', text: 'text-gray-600' };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        style.bg,
        style.text
      )}
    >
      {status}
    </span>
  );
};
